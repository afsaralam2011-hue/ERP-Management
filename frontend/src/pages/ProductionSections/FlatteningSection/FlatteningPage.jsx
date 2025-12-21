// src/pages/ProductionSections/FlatteningSection/FlatteningPage.jsx
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
  FiDatabase as FiDatabaseIcon
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningPage.css';

const FlatteningPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [shifts, setShifts] = useState([]);
  const [targets, setTargets] = useState([]);
  const [showReport, setShowReport] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Report data
  const [reportData, setReportData] = useState({
    date: '',
    formattedDate: '',
    shiftGroups: {},
    totalProduction: 0,
    totalTarget: 0,
    overallEfficiency: 0,
    recordCount: 0,
    machineProduction: {},
    itemProduction: {}
  });

  // Stats states
  const [stats, setStats] = useState({
    totalRecords: 0,
    todayRecords: 0,
    todayProduction: 0,
    todayEfficiency: 0,
    avgEfficiency: 0,
    yesterdayProduction: 0,
    yesterdayEfficiency: 0,
    totalProduction: 0,
    machineWiseToday: {},
    itemWiseToday: {}
  });

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
      
      // Fetch shifts from shifts table
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
      
      if (shiftsError) throw shiftsError;

      // Fetch targets from targets table
      const { data: targetsData, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('section', 'Flattening')
        .eq('is_active', true);

      if (targetsError) throw targetsError;

      // Fetch records from flatteningsection table
      const { data: recordsData, error: recordsError } = await supabase
        .from('flatteningsection')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      setShifts(shiftsData || []);
      setTargets(targetsData || []);
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

  // Calculate stats
  const calculateStats = (recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
        totalRecords: 0,
        todayRecords: 0,
        todayProduction: 0,
        todayEfficiency: 0,
        avgEfficiency: 0,
        yesterdayProduction: 0,
        yesterdayEfficiency: 0,
        totalProduction: 0,
        machineWiseToday: {},
        itemWiseToday: {}
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

    const totalEfficiency = recordsData.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0
    );
    
    const avgEfficiency = recordsData.length > 0 
      ? totalEfficiency / recordsData.length 
      : 0;

    const yesterdayProduction = yesterdayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0
    );

    const yesterdayTotalEfficiency = yesterdayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0
    );
    
    const yesterdayEfficiency = yesterdayRecords.length > 0 
      ? yesterdayTotalEfficiency / yesterdayRecords.length 
      : 0;

    // Today's stats
    const todayProduction = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0
    );

    const todayTotalEfficiency = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0
    );
    
    const todayEfficiency = todayRecords.length > 0 
      ? todayTotalEfficiency / todayRecords.length 
      : 0;

    // Machine-wise today production
    const machineWiseToday = {};
    const itemWiseToday = {};
    
    todayRecords.forEach(record => {
      // Machine data
      const machine = record.machine_no || record.machine_id || 'Unknown';
      if (!machineWiseToday[machine]) {
        machineWiseToday[machine] = {
          production: 0,
          efficiency: 0,
          count: 0
        };
      }
      machineWiseToday[machine].production += parseFloat(record.production_quantity) || 0;
      machineWiseToday[machine].efficiency += parseFloat(record.efficiency) || 0;
      machineWiseToday[machine].count += 1;

      // Item data
      const item = record.item_name || 'Unknown';
      if (!itemWiseToday[item]) {
        itemWiseToday[item] = {
          production: 0,
          efficiency: 0,
          count: 0
        };
      }
      itemWiseToday[item].production += parseFloat(record.production_quantity) || 0;
      itemWiseToday[item].efficiency += parseFloat(record.efficiency) || 0;
      itemWiseToday[item].count += 1;
    });

    // Calculate average efficiency for each machine
    Object.keys(machineWiseToday).forEach(machine => {
      if (machineWiseToday[machine].count > 0) {
        machineWiseToday[machine].efficiency = machineWiseToday[machine].efficiency / machineWiseToday[machine].count;
      }
    });

    // Calculate average efficiency for each item
    Object.keys(itemWiseToday).forEach(item => {
      if (itemWiseToday[item].count > 0) {
        itemWiseToday[item].efficiency = itemWiseToday[item].efficiency / itemWiseToday[item].count;
      }
    });

    setStats({
      totalRecords: recordsData.length,
      todayRecords: todayRecords.length,
      todayProduction,
      todayEfficiency: parseFloat(todayEfficiency.toFixed(1)),
      avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
      yesterdayProduction,
      yesterdayEfficiency: parseFloat(yesterdayEfficiency.toFixed(1)),
      totalProduction,
      machineWiseToday,
      itemWiseToday
    });
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.section_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.machine_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.item_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const recordShift = record.shift_code || record.shift || '';
    const matchesShift = !filterShift || recordShift === filterShift;
    
    const recordDate = new Date(record.created_at).toISOString().split('T')[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesShift && matchesDate;
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
        shiftGroups: {},
        totalProduction: 0,
        totalTarget: 0,
        overallEfficiency: 0,
        recordCount: 0,
        machineProduction: {},
        itemProduction: {}
      });
      return;
    }

    const shiftGroups = {};
    const machineProduction = {};
    const itemProduction = {};
    let totalProduction = 0;
    let totalTarget = 0;

    dateRecords.forEach(record => {
      const shift = record.shift || record.shift_code || 'Unknown';
      const machine = record.machine_no || record.machine_id || 'Unknown';
      const item = record.item_name || 'Unknown';
      const qty = parseFloat(record.production_quantity) || 0;
      
      // Shift groups
      if (!shiftGroups[shift]) {
        shiftGroups[shift] = {
          production: 0,
          target: 0,
          efficiency: 0,
          records: []
        };
      }
      
      shiftGroups[shift].production += qty;
      totalProduction += qty;
      shiftGroups[shift].records.push(record);
      
      // Machine production
      if (!machineProduction[machine]) {
        machineProduction[machine] = {
          production: 0,
          efficiency: 0,
          count: 0
        };
      }
      machineProduction[machine].production += qty;
      machineProduction[machine].efficiency += parseFloat(record.efficiency) || 0;
      machineProduction[machine].count += 1;
      
      // Item production
      if (!itemProduction[item]) {
        itemProduction[item] = {
          production: 0,
          efficiency: 0,
          count: 0
        };
      }
      itemProduction[item].production += qty;
      itemProduction[item].efficiency += parseFloat(record.efficiency) || 0;
      itemProduction[item].count += 1;
      
      // Find target
      const targetRecord = targets.find(t => 
        t.shift_code === shift && 
        t.machine_id === record.machine_id
      );
      
      if (targetRecord) {
        shiftGroups[shift].target += targetRecord.target_qty;
        totalTarget += targetRecord.target_qty;
      }
    });

    // Calculate efficiency
    Object.keys(shiftGroups).forEach(shift => {
      const group = shiftGroups[shift];
      group.efficiency = group.target > 0 ? (group.production / group.target) * 100 : 0;
    });

    // Calculate average efficiency for each machine
    Object.keys(machineProduction).forEach(machine => {
      if (machineProduction[machine].count > 0) {
        machineProduction[machine].efficiency = machineProduction[machine].efficiency / machineProduction[machine].count;
      }
    });

    // Calculate average efficiency for each item
    Object.keys(itemProduction).forEach(item => {
      if (itemProduction[item].count > 0) {
        itemProduction[item].efficiency = itemProduction[item].efficiency / itemProduction[item].count;
      }
    });

    const overallEfficiency = totalTarget > 0 
      ? (totalProduction / totalTarget) * 100 
      : 0;

    setReportData({
      date: selectedDate,
      formattedDate: new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      shiftGroups,
      totalProduction,
      totalTarget,
      overallEfficiency: parseFloat(overallEfficiency.toFixed(2)),
      recordCount: dateRecords.length,
      machineProduction,
      itemProduction
    });
  };

  // Handle report generation when date changes
  useEffect(() => {
    if (filterDate) {
      generateReport(filterDate);
    }
  }, [filterDate, records, targets]);

  // Handlers
  const handleEdit = (id) => {
    navigate(`/production-sections/flattening/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/production-sections/flattening/view/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('flatteningsection')
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
      ['ID', 'Section', 'Machine ID', 'Machine No', 'Item Name', 'Production (KG)', 'Coil Size', 'Shift', 'Operator', 'Efficiency %', 'Remarks', 'Created At'],
      ...filteredRecords.map(record => [
        record.id,
        `"${record.section_name || 'Flattening'}"`,
        `"${record.machine_id || ''}"`,
        `"${record.machine_no || ''}"`,
        `"${record.item_name || ''}"`,
        parseFloat(record.production_quantity) || 0,
        `"${record.coil_size || ''}"`,
        `"${record.shift_code || record.shift || ''}"`,
        `"${record.operator_name || ''}"`,
        parseFloat(record.efficiency) || 0,
        `"${record.remarks || ''}"`,
        `"${new Date(record.created_at).toLocaleString()}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flattening-records-${new Date().toISOString().split('T')[0]}.csv`;
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
        <title>Flattening Section Report - ${reportData.formattedDate}</title>
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
          .machine-table, .item-table { margin: 20px 0; }
          .machine-row, .item-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
          .summary { 
            background-color: #f8f9fa; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
          }
          .summary h3 { margin-top: 0; }
          .efficiency { 
            font-size: 24px; 
            font-weight: bold; 
            color: ${reportData.overallEfficiency >= 90 ? '#28a745' : 
                    reportData.overallEfficiency >= 80 ? '#ffc107' : '#dc3545'}; 
          }
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
          <h1>Flattening Section Production Report</h1>
          <div class="date">${reportData.formattedDate}</div>
        </div>
        
        <h3>Shift-wise Production:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Shift</th>
              <th>Production (KG)</th>
              <th>Target (KG)</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.shiftGroups).map(([shift, data]) => `
              <tr>
                <td>${shift}</td>
                <td>${data.production.toFixed(1)} KG</td>
                <td>${data.target.toFixed(1)} KG</td>
                <td>${data.efficiency.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h3>Machine-wise Production:</h3>
        <div class="machine-table">
          ${Object.entries(reportData.machineProduction).map(([machine, data]) => `
            <div class="machine-row">
              <div><strong>${machine}</strong></div>
              <div>${data.production.toFixed(1)} KG</div>
              <div>${data.efficiency.toFixed(1)}%</div>
            </div>
          `).join('')}
        </div>
        
        <h3>Item-wise Production:</h3>
        <div class="item-table">
          ${Object.entries(reportData.itemProduction).map(([item, data]) => `
            <div class="item-row">
              <div><strong>${item}</strong></div>
              <div>${data.production.toFixed(1)} KG</div>
              <div>${data.efficiency.toFixed(1)}%</div>
            </div>
          `).join('')}
        </div>
        
        <div class="summary">
          <h3>Summary:</h3>
          <p><strong>Total Production:</strong> ${reportData.totalProduction.toFixed(1)} KG</p>
          <p><strong>Total Target:</strong> ${reportData.totalTarget.toFixed(1)} KG</p>
          <p><strong>Overall Efficiency:</strong> <span class="efficiency">${reportData.overallEfficiency}%</span></p>
          <p><strong>Total Records:</strong> ${reportData.recordCount}</p>
        </div>
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()}<br/>
          Flattening Section - Production Management System
        </div>
        
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
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
      ['Flattening Section Production Report', reportData.formattedDate],
      [],
      ['Shift', 'Production (KG)', 'Target (KG)', 'Efficiency (%)'],
      ...Object.entries(reportData.shiftGroups).map(([shift, data]) => [
        shift,
        data.production.toFixed(1),
        data.target.toFixed(1),
        data.efficiency.toFixed(1)
      ]),
      [],
      ['Machine-wise Production'],
      ['Machine', 'Production (KG)', 'Efficiency (%)'],
      ...Object.entries(reportData.machineProduction).map(([machine, data]) => [
        machine,
        data.production.toFixed(1),
        data.efficiency.toFixed(1)
      ]),
      [],
      ['Item-wise Production'],
      ['Item', 'Production (KG)', 'Efficiency (%)'],
      ...Object.entries(reportData.itemProduction).map(([item, data]) => [
        item,
        data.production.toFixed(1),
        data.efficiency.toFixed(1)
      ]),
      [],
      ['SUMMARY'],
      ['Total Production (KG):', reportData.totalProduction.toFixed(1)],
      ['Total Target (KG):', reportData.totalTarget.toFixed(1)],
      ['Overall Efficiency (%):', reportData.overallEfficiency],
      ['Total Records:', reportData.recordCount],
      [],
      ['Generated on:', new Date().toLocaleString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flattening-report-${filterDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const uniqueShiftCodes = [...new Set(
    records
      .map(record => record.shift_code || record.shift)
      .filter(Boolean)
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

  // Production Sections for switcher - آپ کی ترتیب کے مطابق
  const productionSections = [
    { id: 'raw-material', name: 'Raw Material Section', icon: FiArchive, path: '/production-sections/raw-material', color: '#06b6d4' },
    { id: 'flattening', name: 'Flattening Section', icon: FiPackage, path: '/production-sections/flattening', color: '#10b981' },
    { id: 'spiral', name: 'Spiral Section', icon: FiColumns, path: '/production-sections/spiral', color: '#3b82f6' },
    { id: 'pvc-coating', name: 'PVC Coating Section', icon: FiLayers, path: '/production-sections/pvc-coating', color: '#8b5cf6' },
    { id: 'cutting-packing', name: 'Cutting & Packing Section', icon: FiScissors, path: '/production-sections/cutting-packing', color: '#f59e0b' },
    { id: 'finished-goods', name: 'Finished Goods Section', icon: FiCheckSquare, path: '/production-sections/finished-goods', color: '#ec4899' }
  ];

  // Stats with different colors and icons
  const statCards = [
    {
      id: 'total-records',
      title: 'Total Records',
      value: stats.totalRecords,
      icon: FiDatabaseIcon,
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      description: 'All records in database',
      gradientColors: ['#3b82f6', '#1d4ed8'],
      iconBg: '#3b82f6'
    },
    {
      id: 'today-records',
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiClock,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Added today',
      gradientColors: ['#10b981', '#059669'],
      iconBg: '#10b981'
    },
    {
      id: 'today-production',
      title: 'Today Production Quantity',
      value: `${stats.todayProduction.toLocaleString()} KG`,
      icon: FiPackage,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      description: "Today's total production",
      gradientColors: ['#f59e0b', '#d97706'],
      iconBg: '#f59e0b'
    },
    {
      id: 'today-efficiency',
      title: 'Today Efficiency',
      value: `${stats.todayEfficiency}%`,
      icon: FiActivity,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      description: "Today's average efficiency",
      colorValue: true,
      valueColor: stats.todayEfficiency >= 80 ? '#059669' :
                  stats.todayEfficiency >= 60 ? '#d97706' : '#ef4444',
      gradientColors: ['#8b5cf6', '#7c3aed'],
      iconBg: '#8b5cf6'
    },
    {
      id: 'total-production',
      title: 'Total Production',
      value: `${stats.totalProduction.toLocaleString()} KG`,
      icon: FiTrendingUpIcon,
      color: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      description: 'Total units produced',
      gradientColors: ['#ec4899', '#be185d'],
      iconBg: '#ec4899'
    },
    {
      id: 'yesterday-production',
      title: 'Yesterday Production',
      value: `${stats.yesterdayProduction.toLocaleString()} KG`,
      icon: FiTrendingDown,
      color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      description: 'Previous day total',
      gradientColors: ['#06b6d4', '#0891b2'],
      iconBg: '#06b6d4'
    },
    {
      id: 'yesterday-efficiency',
      title: 'Yesterday Efficiency',
      value: `${stats.yesterdayEfficiency}%`,
      icon: FiTarget,
      color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      description: 'Previous day average',
      colorValue: true,
      valueColor: stats.yesterdayEfficiency >= 80 ? '#059669' :
                  stats.yesterdayEfficiency >= 60 ? '#d97706' : '#ef4444',
      gradientColors: ['#6366f1', '#4f46e5'],
      iconBg: '#6366f1'
    },
    {
      id: 'avg-efficiency',
      title: 'Avg Efficiency',
      value: `${stats.avgEfficiency}%`,
      icon: FiPercent,
      color: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      description: 'Overall average efficiency',
      colorValue: true,
      valueColor: stats.avgEfficiency >= 80 ? '#059669' :
                  stats.avgEfficiency >= 60 ? '#d97706' : '#ef4444',
      gradientColors: ['#f97316', '#ea580c'],
      iconBg: '#f97316'
    }
  ];

  // Render loading state
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <h3>Loading Flattening Section Data...</h3>
        <p className="loading-subtext">Fetching records from database</p>
      </div>
    );
  }

  return (
    <div className="flattening-container">
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
              <FiPackage size={28} />
            </div>
            <div>
              <h1 className="page-title">
                Flattening Section
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
                Data from: flatteningsection table • Total Records: {stats.totalRecords}
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => navigate('/production-sections/flattening/new')}
            className="primary-btn"
          >
            <FiPlus size={20} /> New Record
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
        <div className="bg-pattern" />
        
        <div className="switcher-header">
          <div className="switcher-icon">
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
              <div className={`section-card ${section.id === 'flattening' ? 'active' : ''}`}>
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
              {section.id !== 'flattening' && (
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

      {/* Today's Production & Efficiency Section */}
      <div className="today-production-section">
        <div className="section-header">
          <div className="header-icon">
            <FiBarChart size={20} />
          </div>
          <div>
            <h3>Today's Production & Efficiency</h3>
            <p className="section-subtitle">Real-time production data for today</p>
          </div>
        </div>

        <div className="production-stats-container">
          <div className="machine-production-grid">
            <h4 className="grid-title">Machine-wise Production</h4>
            {Object.entries(stats.machineWiseToday).length > 0 ? (
              Object.entries(stats.machineWiseToday).map(([machine, data]) => (
                <div key={machine} className="machine-card">
                  <div className="machine-header">
                    <div className="machine-icon-small">
                      <FiTool size={14} />
                    </div>
                    <div className="machine-name">{machine}</div>
                  </div>
                  <div className="machine-stats">
                    <div className="machine-production-value">
                      {data.production.toFixed(0)} <span className="unit">KG</span>
                    </div>
                    <div className={`machine-efficiency ${data.efficiency >= 80 ? 'high' : data.efficiency >= 60 ? 'medium' : 'low'}`}>
                      {data.efficiency.toFixed(1)}% <FiActivity size={12} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-production">
                <FiPackage size={24} />
                <div>No production recorded today</div>
              </div>
            )}
          </div>

          <div className="item-production-grid">
            <h4 className="grid-title">Item-wise Production</h4>
            {Object.entries(stats.itemWiseToday).length > 0 ? (
              Object.entries(stats.itemWiseToday).map(([item, data]) => (
                <div key={item} className="item-card">
                  <div className="item-header">
                    <div className="item-icon-small">
                      <FiTag size={14} />
                    </div>
                    <div className="item-name">{item}</div>
                  </div>
                  <div className="item-stats">
                    <div className="item-production-value">
                      {data.production.toFixed(0)} <span className="unit">KG</span>
                    </div>
                    <div className={`item-efficiency ${data.efficiency >= 80 ? 'high' : data.efficiency >= 60 ? 'medium' : 'low'}`}>
                      {data.efficiency.toFixed(1)}% <FiActivity size={12} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-production">
                <FiPackage size={24} />
                <div>No items recorded today</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - 8 Cards with Different Colors and Shadows */}
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
        <div className="filter-header">
          <FiFilter size={10} /> FILTERS
        </div>
        
        <div className="filter-input-group">
          <label className="filter-label">
            <FiSearch style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Search Records
          </label>
          <input
            type="text"
            placeholder="Search by machine, operator, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-select-group">
          <label className="filter-label">
            <FiFilter style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Filter by Shift
          </label>
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="filter-select"
          >
            <option value="">All Shifts</option>
            {uniqueShiftCodes.map(shiftCode => (
              <option key={shiftCode} value={shiftCode}>
                {shiftCode}
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
          >
            <FiBarChart2 /> Generate Report
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterShift('');
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
          <div className="report-bg-pattern" />
          
          <div className="report-header">
            <div>
              <h2>Flattening Section Daily Report</h2>
              <div className="report-date">
                {reportData.formattedDate}
              </div>
            </div>
            <div className="report-actions">
              <button
                onClick={handlePrintReport}
                className="print-btn"
              >
                <FiPrinter /> Print Report
              </button>
              <button
                onClick={handleExportReport}
                className="export-report-btn"
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

          {/* Shift-wise Production */}
          {Object.keys(reportData.shiftGroups).length > 0 && (
            <div className="shift-production-section">
              <h3>Shift-wise Production Summary</h3>
              <div className="shift-grid">
                {Object.entries(reportData.shiftGroups).map(([shift, data]) => (
                  <div key={shift} className="shift-card">
                    <div className="shift-label">
                      Shift ({shift})
                    </div>
                    <div className="shift-production">
                      {data.production.toFixed(1)} KG
                    </div>
                    <div 
                      className="shift-efficiency"
                      style={{ 
                        color: data.efficiency >= 80 ? '#059669' :
                               data.efficiency >= 60 ? '#d97706' : '#ef4444'
                      }}
                    >
                      Efficiency: {data.efficiency.toFixed(1)}%
                    </div>
                    <div className="shift-target">
                      Target: {data.target.toFixed(1)} KG
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Machine-wise Production in Report */}
          {Object.keys(reportData.machineProduction).length > 0 && (
            <div className="machine-report-section">
              <h3>Machine-wise Production</h3>
              <div className="machine-report-grid">
                {Object.entries(reportData.machineProduction).map(([machine, data]) => (
                  <div key={machine} className="machine-report-card">
                    <div className="machine-report-header">
                      <div className="machine-report-icon">
                        <FiTool size={16} />
                      </div>
                      <div className="machine-report-name">{machine}</div>
                    </div>
                    <div className="machine-report-stats">
                      <div className="machine-report-production">
                        {data.production.toFixed(1)} KG
                      </div>
                      <div 
                        className="machine-report-efficiency"
                        style={{ 
                          color: data.efficiency >= 80 ? '#059669' :
                                 data.efficiency >= 60 ? '#d97706' : '#ef4444'
                        }}
                      >
                        {data.efficiency.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item-wise Production in Report */}
          {Object.keys(reportData.itemProduction).length > 0 && (
            <div className="item-report-section">
              <h3>Item-wise Production</h3>
              <div className="item-report-grid">
                {Object.entries(reportData.itemProduction).map(([item, data]) => (
                  <div key={item} className="item-report-card">
                    <div className="item-report-header">
                      <div className="item-report-icon">
                        <FiTag size={16} />
                      </div>
                      <div className="item-report-name">{item}</div>
                    </div>
                    <div className="item-report-stats">
                      <div className="item-report-production">
                        {data.production.toFixed(1)} KG
                      </div>
                      <div 
                        className="item-report-efficiency"
                        style={{ 
                          color: data.efficiency >= 80 ? '#059669' :
                                 data.efficiency >= 60 ? '#d97706' : '#ef4444'
                        }}
                      >
                        {data.efficiency.toFixed(1)}%
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
                  {reportData.totalProduction.toFixed(1)} KG
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Total Target</div>
                <div className="summary-value target-value">
                  {reportData.totalTarget.toFixed(1)} KG
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Overall Efficiency</div>
                <div 
                  className="summary-value efficiency-value"
                  style={{ 
                    color: reportData.overallEfficiency >= 80 ? '#059669' :
                           reportData.overallEfficiency >= 60 ? '#d97706' : '#ef4444'
                  }}
                >
                  {reportData.overallEfficiency}%
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
            Report generated on {new Date().toLocaleString()} • Data source: flatteningsection table
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="records-table-section">
        <div className="table-header-section">
          <div>
            <h3>Production Records</h3>
            <div className="table-stats">
              Total: {records.length} records • Showing: {filteredRecords.length} filtered • Page: {currentPage}/{totalPages}
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
            Loading records from flatteningsection...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-records">
            <FiPackage size={48} />
            <div className="empty-title">No records found</div>
            <div className="empty-message">
              {searchTerm || filterDate || filterShift 
                ? 'No records match your search criteria. Try adjusting your filters.'
                : 'No production records available. Create your first record to get started.'}
            </div>
            <button
              onClick={() => navigate('/production-sections/flattening/new')}
              className="create-first-btn"
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
                    <th className="table-header-cell">Machine</th>
                    <th className="table-header-cell">Item Details</th>
                    <th className="table-header-cell">Production Quantity</th>
                    <th className="table-header-cell">Shift</th>
                    <th className="table-header-cell">Operator Name</th>
                    <th className="table-header-cell">Efficiency</th>
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
                        #{record.id}
                      </td>
                      <td className="table-cell">
                        <div className="machine-info">
                          <div className="machine-icon">
                            <FiTool size={16} />
                          </div>
                          <div>
                            <div className="machine-id">
                              {record.machine_id || 'N/A'}
                            </div>
                            <div className="machine-number">
                              Machine No: {record.machine_no || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="item-info">
                          <div className="item-icon">
                            <FiPackage size={16} />
                          </div>
                          <div>
                            <div className="item-name">
                              {record.item_name || 'N/A'}
                            </div>
                            <div className="item-size">
                              Size: {record.coil_size || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell production-cell">
                        <div className="production-badge">
                          <div className="production-value">
                            {parseFloat(record.production_quantity).toLocaleString()}
                          </div>
                          <div className="production-unit">
                            KILOGRAMS
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="shift-badge">
                          {record.shift_code || record.shift || 'N/A'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="operator-info">
                          <div className="operator-avatar">
                            {record.operator_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="operator-name">
                              {record.operator_name || 'Unknown'}
                            </div>
                            <div className="operator-role">
                              Operator
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className={`efficiency-badge ${
                          record.efficiency > 80 ? 'high' :
                          record.efficiency > 60 ? 'medium' : 'low'
                        }`}>
                          {record.efficiency ? `${parseFloat(record.efficiency).toFixed(1)}%` : 'N/A'}
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
              Flattening Section • Production Management System
            </div>
            <div className="footer-subtitle">
              Database: flatteningsection table • Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="footer-status">
            <div className={`database-connection ${isSupabaseConnected ? 'connected' : 'offline'}`}>
              <div className={`connection-dot ${isSupabaseConnected ? 'connected' : 'offline'}`} />
              {isSupabaseConnected ? 'Supabase Database Connected' : 'Database Connection Issue'}
            </div>
            <div className="footer-stats">
              {stats.totalRecords} total records • {stats.todayProduction} KG today • {stats.totalProduction.toLocaleString()} KG total production
            </div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button
            onClick={() => navigate('/production-sections/flattening/new')}
            className="footer-btn add-btn"
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

export default FlatteningPage;