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
  FiGrid, FiSettings, FiX as FiXIcon, FiTool,
  FiCheckSquare, FiCrop, FiDivide,
  FiBriefcase, FiBox, FiArchive, FiColumns,
  FiArrowRight, FiBarChart, FiHash, FiTag,
  FiDollarSign, FiPercent,
  FiTrendingDown, FiTrendingUp as FiTrendingUpIcon,
  FiDatabase as FiDatabaseIcon, FiArrowUp, FiArrowDown,
  FiStar, FiAward, FiCoffee, FiWind, FiZap,
  FiCheck, FiAlertTriangle, FiCircle
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import FlatteningForm from './FlatteningForm';
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
  const [showFlatteningModal, setShowFlatteningModal] = useState(false);
  
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
    totalTarget: 0,
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
      
      if (!supabase) {
        const errorMsg = 'Supabase client not initialized';
        setError(errorMsg);
        return;
      }
      
      // Fetch shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
      
      if (shiftsError) {
        console.error("Error fetching shifts:", shiftsError);
      }

      // Fetch targets
      const { data: targetsData, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('section', 'Flattening')
        .eq('is_active', true);

      if (targetsError) {
        console.error("Error fetching targets:", targetsError);
      }

      // Fetch records
      const { data: recordsData, error: recordsError } = await supabase
        .from('flatteningsection')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordsError) {
        console.error("Error fetching records:", recordsError);
        setRecords([]);
        calculateStats([], targetsData || []);
      } else {
        setRecords(recordsData || []);
        calculateStats(recordsData || [], targetsData || []);
      }

      setShifts(shiftsData || []);
      setTargets(targetsData || []);
      
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error.message);
      setRecords([]);
      calculateStats([], []);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats with targets
  const calculateStats = (recordsData, targetsData) => {
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
        totalTarget: 0,
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

    // Calculate total target from targetsData
    const totalTarget = targetsData.reduce((sum, target) => 
      sum + (parseFloat(target.target_qty) || 0), 0
    );

    // Machine-wise today production
    const machineWiseToday = {};
    const itemWiseToday = {};
    
    todayRecords.forEach(record => {
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

    Object.keys(machineWiseToday).forEach(machine => {
      if (machineWiseToday[machine].count > 0) {
        machineWiseToday[machine].efficiency = machineWiseToday[machine].efficiency / machineWiseToday[machine].count;
      }
    });

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
      totalTarget,
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

  // Get target for a record
  const getTargetForRecord = (record) => {
    const targetRecord = targets.find(t => 
      t.shift_code === (record.shift_code || record.shift) && 
      t.machine_id === record.machine_id
    );
    return targetRecord ? parseFloat(targetRecord.target_qty) : 0;
  };

  // Sort machines by number
  const getSortedMachines = () => {
    return Object.entries(stats.machineWiseToday)
      .sort(([a], [b]) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
  };

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
      
      const targetRecord = targets.find(t => 
        t.shift_code === shift && 
        t.machine_id === record.machine_id
      );
      
      if (targetRecord) {
        shiftGroups[shift].target += targetRecord.target_qty;
        totalTarget += targetRecord.target_qty;
      }
    });

    Object.keys(shiftGroups).forEach(shift => {
      const group = shiftGroups[shift];
      group.efficiency = group.target > 0 ? (group.production / group.target) * 100 : 0;
    });

    Object.keys(machineProduction).forEach(machine => {
      if (machineProduction[machine].count > 0) {
        machineProduction[machine].efficiency = machineProduction[machine].efficiency / machineProduction[machine].count;
      }
    });

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
      ['ID', 'Section', 'Machine ID', 'Machine No', 'Item Name', 'Production (KG)', 'Target (KG)', 'Coil Size', 'Shift', 'Operator', 'Efficiency %', 'Remarks', 'Created At'],
      ...filteredRecords.map(record => [
        record.id,
        `"${record.section_name || 'Flattening'}"`,
        `"${record.machine_id || ''}"`,
        `"${record.machine_no || ''}"`,
        `"${record.item_name || ''}"`,
        parseFloat(record.production_quantity) || 0,
        getTargetForRecord(record),
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

  // Print report - Improved design
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
        <title>Flattening Report - ${reportData.formattedDate}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            margin: 15px;
            font-size: 12px;
            line-height: 1.5;
            color: #1e293b;
            background: #ffffff;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .report-title {
            font-size: 18px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
          }
          
          .report-date { 
            color: #64748b; 
            font-size: 14px;
            font-weight: 500;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin: 20px 0;
          }
          
          .summary-item {
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
          }
          
          .summary-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .summary-label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          
          .summary-value {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #334155;
            margin: 25px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            font-size: 11px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          
          .table th, .table td { 
            border: 1px solid #e2e8f0; 
            padding: 10px 12px; 
            text-align: center; 
          }
          
          .table th { 
            background-color: #f1f5f9;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .table tr:hover {
            background-color: #f1f5f9;
          }
          
          .efficiency-good {
            color: #059669;
            font-weight: 600;
          }
          
          .efficiency-average {
            color: #d97706;
            font-weight: 600;
          }
          
          .efficiency-poor {
            color: #dc3545;
            font-weight: 600;
          }
          
          .compact-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          
          .compact-box {
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 10px;
            background: #f8fafc;
          }
          
          .compact-title {
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .compact-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .compact-row:last-child {
            border-bottom: none;
          }
          
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            color: #64748b; 
            font-size: 11px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer strong {
            color: #334155;
            font-weight: 600;
          }
          
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          
          .signature-box {
            text-align: center;
            width: 30%;
          }
          
          .signature-line {
            margin-top: 40px;
            border-top: 1px solid #94a3b8;
            width: 100%;
          }
          
          .signature-name {
            margin-top: 5px;
            font-weight: 600;
            color: #334155;
          }
          
          .signature-title {
            font-size: 11px;
            color: #64748b;
          }
          
          @media print {
            body { 
              margin: 10mm;
              font-size: 11px;
            }
            
            .no-print { 
              display: none; 
            }
            
            .header {
              margin-bottom: 15px;
            }
            
            .summary-grid {
              gap: 8px;
              margin: 15px 0;
            }
            
            .summary-item {
              padding: 10px;
            }
            
            .section-title {
              margin: 20px 0 10px 0;
            }
            
            .table {
              font-size: 10px;
            }
            
            .table th, .table td {
              padding: 8px 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">ERP Management System</div>
          <div class="report-title">Flattening Section Production Report</div>
          <div class="report-date">${reportData.formattedDate}</div>
        </div>
        
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Total Production</div>
            <div class="summary-value">${reportData.totalProduction.toFixed(1)} KG</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Target</div>
            <div class="summary-value">${reportData.totalTarget.toFixed(1)} KG</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Overall Efficiency</div>
            <div class="summary-value ${
              reportData.overallEfficiency >= 90 ? 'efficiency-good' :
              reportData.overallEfficiency >= 80 ? 'efficiency-average' : 'efficiency-poor'
            }">
              ${reportData.overallEfficiency.toFixed(1)}%
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Records</div>
            <div class="summary-value">${reportData.recordCount}</div>
          </div>
        </div>
        
        <div class="section-title">Shift-wise Production Summary</div>
        <table class="table">
          <thead>
            <tr>
              <th>Shift</th>
              <th>Production (KG)</th>
              <th>Target (KG)</th>
              <th>Efficiency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.shiftGroups).map(([shift, data]) => `
              <tr>
                <td><strong>${shift}</strong></td>
                <td>${data.production.toFixed(1)}</td>
                <td>${data.target.toFixed(1)}</td>
                <td class="${
                  data.efficiency >= 90 ? 'efficiency-good' :
                  data.efficiency >= 80 ? 'efficiency-average' : 'efficiency-poor'
                }">
                  ${data.efficiency.toFixed(1)}%
                </td>
                <td>
                  ${data.efficiency >= 90 ? '✓ Excellent' :
                    data.efficiency >= 80 ? '✓ Good' :
                    data.efficiency >= 70 ? '✓ Average' : '⚠ Needs Improvement'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="compact-section">
          <div class="compact-box">
            <div class="compact-title">Machine-wise Production</div>
            ${Object.entries(reportData.machineProduction)
              .sort(([a], [b]) => {
                const numA = parseInt(a.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.replace(/\D/g, '')) || 0;
                return numA - numB;
              })
              .map(([machine, data]) => `
              <div class="compact-row">
                <span><strong>${machine}</strong></span>
                <span>
                  ${data.production.toFixed(1)} KG 
                  <span class="${
                    data.efficiency >= 90 ? 'efficiency-good' :
                    data.efficiency >= 80 ? 'efficiency-average' : 'efficiency-poor'
                  }">
                    (${data.efficiency.toFixed(1)}%)
                  </span>
                </span>
              </div>
            `).join('')}
          </div>
          
          <div class="compact-box">
            <div class="compact-title">Item-wise Production</div>
            ${Object.entries(reportData.itemProduction).map(([item, data]) => `
              <div class="compact-row">
                <span><strong>${item}</strong></span>
                <span>
                  ${data.production.toFixed(1)} KG 
                  <span class="${
                    data.efficiency >= 90 ? 'efficiency-good' :
                    data.efficiency >= 80 ? 'efficiency-average' : 'efficiency-poor'
                  }">
                    (${data.efficiency.toFixed(1)}%)
                  </span>
                </span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div>Prepared By</div>
            <div class="signature-line"></div>
            <div class="signature-name">Production Supervisor</div>
            <div class="signature-title">Flattening Section</div>
          </div>
          
          <div class="signature-box">
            <div>Checked By</div>
            <div class="signature-line"></div>
            <div class="signature-name">Production Manager</div>
            <div class="signature-title">Manufacturing</div>
          </div>
          
          <div class="signature-box">
            <div>Approved By</div>
            <div class="signature-line"></div>
            <div class="signature-name">Plant Head</div>
            <div class="signature-title">Operations</div>
          </div>
        </div>
        
        <div class="footer">
          <strong>Report generated:</strong> ${new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}<br/>
          <strong>Data source:</strong> flatteningsection table • <strong>System:</strong> ERP Management System v2.0
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="
            padding: 10px 20px;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
          ">
            🖨️ Print Report
          </button>
          <button onclick="window.close()" style="
            padding: 10px 20px;
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
          ">
            ✕ Close Window
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
      ['Shift', 'Production (KG)', 'Target (KG)', 'Efficiency (%)', 'Status'],
      ...Object.entries(reportData.shiftGroups).map(([shift, data]) => [
        shift,
        data.production.toFixed(1),
        data.target.toFixed(1),
        data.efficiency.toFixed(1),
        data.efficiency >= 90 ? 'Excellent' :
        data.efficiency >= 80 ? 'Good' :
        data.efficiency >= 70 ? 'Average' : 'Needs Improvement'
      ]),
      [],
      ['Machine-wise Production'],
      ['Machine', 'Production (KG)', 'Efficiency (%)', 'Status'],
      ...Object.entries(reportData.machineProduction)
        .sort(([a], [b]) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        })
        .map(([machine, data]) => [
          machine,
          data.production.toFixed(1),
          data.efficiency.toFixed(1),
          data.efficiency >= 90 ? 'Excellent' :
          data.efficiency >= 80 ? 'Good' :
          data.efficiency >= 70 ? 'Average' : 'Needs Improvement'
        ]),
      [],
      ['Item-wise Production'],
      ['Item', 'Production (KG)', 'Efficiency (%)', 'Status'],
      ...Object.entries(reportData.itemProduction).map(([item, data]) => [
        item,
        data.production.toFixed(1),
        data.efficiency.toFixed(1),
        data.efficiency >= 90 ? 'Excellent' :
        data.efficiency >= 80 ? 'Good' :
        data.efficiency >= 70 ? 'Average' : 'Needs Improvement'
      ]),
      [],
      ['SUMMARY'],
      ['Total Production (KG):', reportData.totalProduction.toFixed(1)],
      ['Total Target (KG):', reportData.totalTarget.toFixed(1)],
      ['Overall Efficiency (%):', reportData.overallEfficiency.toFixed(1)],
      ['Status:', reportData.overallEfficiency >= 90 ? 'Excellent' :
                reportData.overallEfficiency >= 80 ? 'Good' :
                reportData.overallEfficiency >= 70 ? 'Average' : 'Needs Improvement'],
      ['Total Records:', reportData.recordCount],
      [],
      ['Generated on:', new Date().toLocaleString()],
      ['Generated by:', 'ERP Management System']
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

  // Enhanced stat cards with indicators
  const statCards = [
    {
      id: 'today-records',
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiClock,
      description: 'Records added today',
      color: '#10b981',
      indicator: stats.todayRecords > 0 ? 'up' : 'neutral',
      trend: stats.todayRecords > stats.yesterdayProduction ? '+12%' : '-5%'
    },
    {
      id: 'today-production',
      title: "Today's Production",
      value: `${stats.todayProduction.toLocaleString()} KG`,
      icon: FiPackage,
      description: 'Production today',
      color: '#3b82f6',
      indicator: stats.todayProduction > stats.yesterdayProduction ? 'up' : 'down',
      trend: stats.todayProduction > stats.yesterdayProduction ? '+8%' : '-3%'
    },
    {
      id: 'today-efficiency',
      title: "Today's Efficiency",
      value: `${stats.todayEfficiency}%`,
      icon: FiActivity,
      description: 'Efficiency today',
      color: stats.todayEfficiency >= 80 ? '#10b981' :
             stats.todayEfficiency >= 60 ? '#f59e0b' : '#ef4444',
      indicator: stats.todayEfficiency >= 80 ? 'excellent' :
                 stats.todayEfficiency >= 60 ? 'good' : 'poor',
      trend: stats.todayEfficiency > stats.yesterdayEfficiency ? '+5%' : '-2%'
    },
    {
      id: 'yesterday',
      title: 'Yesterday',
      value: `${stats.yesterdayProduction.toLocaleString()} KG`,
      subValue: `${stats.yesterdayEfficiency}%`,
      icon: FiTrendingDown,
      description: 'Production & Efficiency',
      color: '#8b5cf6',
      indicator: stats.yesterdayEfficiency >= 80 ? 'good' : 'average',
      trend: 'Previous Day'
    },
    {
      id: 'total-records',
      title: 'Total Records',
      value: stats.totalRecords,
      icon: FiDatabaseIcon,
      description: 'All time records',
      color: '#ec4899',
      indicator: 'neutral',
      trend: 'Database'
    },
    {
      id: 'total-production',
      title: 'Total Production',
      value: `${stats.totalProduction.toLocaleString()} KG`,
      icon: FiTrendingUpIcon,
      description: 'All time production',
      color: '#06b6d4',
      indicator: 'up',
      trend: '+15% MoM'
    },
    {
      id: 'avg-efficiency',
      title: 'Avg Efficiency',
      value: `${stats.avgEfficiency}%`,
      icon: FiPercent,
      description: 'Overall average',
      color: stats.avgEfficiency >= 80 ? '#10b981' :
             stats.avgEfficiency >= 60 ? '#f59e0b' : '#ef4444',
      indicator: stats.avgEfficiency >= 80 ? 'excellent' :
                 stats.avgEfficiency >= 60 ? 'good' : 'needs-improvement',
      trend: 'Historical'
    },
    {
      id: 'target-achievement',
      title: 'Target vs Actual',
      value: stats.totalTarget > 0 ? `${((stats.totalProduction / stats.totalTarget) * 100).toFixed(1)}%` : 'N/A',
      icon: FiTarget,
      description: 'Target achievement',
      color: stats.totalTarget > 0 && (stats.totalProduction / stats.totalTarget) >= 1 ? '#10b981' : '#ef4444',
      indicator: stats.totalTarget > 0 && (stats.totalProduction / stats.totalTarget) >= 1 ? 'achieved' : 'not-achieved',
      trend: `${stats.totalProduction.toLocaleString()}/${stats.totalTarget.toLocaleString()} KG`
    }
  ];

  // Render loading state
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
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
            <strong>Database Connection Issue</strong>
            <div className="alert-subtext">
              Please check your connection settings
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="header-section">
        <div className="header-left">
          <div className="breadcrumb-nav">
            <button
              onClick={() => navigate('/production')}
              className="breadcrumb-btn back-btn"
            >
              <FiArrowLeft size={18} /> Back to Production
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="breadcrumb-btn secondary"
            >
              <FiHome size={16} /> Dashboard
            </button>
          </div>
          <div className="title-section">
            <div className="title-icon">
              <FiPackage size={28} />
            </div>
            <div>
              <h1 className="page-title">
                <span className="title-main">Flattening Section</span>
                <span className="title-sub">Production Dashboard</span>
              </h1>
              <p className="page-subtitle">
                <span className="subtitle-item">
                  <FiDatabase size={14} /> Total Records: {stats.totalRecords}
                </span>
                <span className="subtitle-item">
                  <FiTarget size={14} /> Target: {stats.totalTarget.toLocaleString()} KG
                </span>
                <span className="subtitle-item">
                  <FiTrendingUp size={14} /> Production: {stats.totalProduction.toLocaleString()} KG
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowFlatteningModal(true)}
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

      {/* Stats Cards Section - Enhanced Design */}
      <div className="stats-section">
        <div className="section-header">
          <div className="header-icon">
            <FiBarChart size={24} />
          </div>
          <div>
            <h2>Key Performance Indicators</h2>
            <p className="section-subtitle">Real-time performance metrics for Flattening Section</p>
          </div>
        </div>

        <div className="stats-grid-enhanced">
          {statCards.map((card) => (
            <div
              key={card.id}
              className="stat-card-enhanced"
              style={{ '--card-color': card.color }}
            >
              <div className="stat-card-header">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon-enhanced">
                    <card.icon size={22} />
                  </div>
                  <div className="stat-title-wrapper">
                    <div className="stat-title-enhanced">{card.title}</div>
                    <div className="stat-trend">
                      {card.trend && (
                        <span className={`trend-${card.indicator}`}>
                          {card.indicator === 'up' && <FiArrowUp size={12} />}
                          {card.indicator === 'down' && <FiArrowDown size={12} />}
                          {card.indicator === 'excellent' && <FiStar size={12} />}
                          {card.indicator === 'good' && <FiCheck size={12} />}
                          {card.indicator === 'poor' && <FiAlertTriangle size={12} />}
                          {card.indicator === 'achieved' && <FiAward size={12} />}
                          {card.indicator === 'not-achieved' && <FiXIcon size={12} />}
                          {card.indicator === 'neutral' && <FiCircle size={12} />}
                          {card.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card-body">
                <div className="stat-value-enhanced">{card.value}</div>
                {card.subValue && (
                  <div className="stat-subvalue">{card.subValue}</div>
                )}
              </div>
              
              <div className="stat-card-footer">
                <div className="stat-description">{card.description}</div>
                <div className={`indicator indicator-${card.indicator}`}>
                  {card.indicator === 'up' && '↑ Increasing'}
                  {card.indicator === 'down' && '↓ Decreasing'}
                  {card.indicator === 'excellent' && '★ Excellent'}
                  {card.indicator === 'good' && '✓ Good'}
                  {card.indicator === 'poor' && '⚠ Needs Attention'}
                  {card.indicator === 'achieved' && '🏆 Target Achieved'}
                  {card.indicator === 'not-achieved' && '🎯 Target Pending'}
                  {card.indicator === 'neutral' && '● Stable'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Production & Efficiency Section */}
      <div className="today-production-section">
        <div className="section-header">
          <div className="header-icon">
            <FiTool size={24} />
          </div>
          <div>
            <h2>Today's Production Analysis</h2>
            <p className="section-subtitle">Machine-wise and Item-wise production for today</p>
          </div>
        </div>

        <div className="production-analysis-container">
          <div className="machine-analysis">
            <div className="analysis-header">
              <h3>Machine-wise Production</h3>
              <div className="analysis-summary">
                <span>Total: {getSortedMachines().reduce((sum, [_, data]) => sum + data.production, 0).toFixed(0)} KG</span>
              </div>
            </div>
            
            <div className="machine-analysis-grid">
              {getSortedMachines().map(([machine, data]) => (
                <div key={machine} className="machine-analysis-card">
                  <div className="machine-analysis-header">
                    <div className="machine-analysis-icon">
                      <FiTool size={16} />
                    </div>
                    <div className="machine-analysis-name">{machine}</div>
                    <div className={`machine-status ${data.efficiency >= 80 ? 'status-good' : data.efficiency >= 60 ? 'status-average' : 'status-poor'}`}></div>
                  </div>
                  
                  <div className="machine-analysis-stats">
                    <div className="production-stats">
                      <div className="production-value">{data.production.toFixed(0)} KG</div>
                      <div className="production-label">Production</div>
                    </div>
                    
                    <div className="efficiency-stats">
                      <div className={`efficiency-value ${data.efficiency >= 80 ? 'value-good' : data.efficiency >= 60 ? 'value-average' : 'value-poor'}`}>
                        {data.efficiency.toFixed(1)}%
                      </div>
                      <div className="efficiency-label">Efficiency</div>
                    </div>
                  </div>
                  
                  <div className="machine-analysis-footer">
                    <div className="performance-bar">
                      <div 
                        className="performance-fill"
                        style={{ 
                          width: `${Math.min(data.efficiency, 100)}%`,
                          backgroundColor: data.efficiency >= 80 ? '#10b981' :
                                         data.efficiency >= 60 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="item-analysis">
            <div className="analysis-header">
              <h3>Item-wise Production</h3>
              <div className="analysis-summary">
                <span>Total: {Object.values(stats.itemWiseToday).reduce((sum, data) => sum + data.production, 0).toFixed(0)} KG</span>
              </div>
            </div>
            
            <div className="item-analysis-grid">
              {Object.entries(stats.itemWiseToday).map(([item, data]) => (
                <div key={item} className="item-analysis-card">
                  <div className="item-analysis-header">
                    <div className="item-analysis-icon">
                      <FiPackage size={16} />
                    </div>
                    <div className="item-analysis-name">{item}</div>
                  </div>
                  
                  <div className="item-analysis-stats">
                    <div className="production-stats">
                      <div className="production-value">{data.production.toFixed(0)} KG</div>
                      <div className="production-label">Production</div>
                    </div>
                    
                    <div className="efficiency-stats">
                      <div className={`efficiency-value ${data.efficiency >= 80 ? 'value-good' : data.efficiency >= 60 ? 'value-average' : 'value-poor'}`}>
                        {data.efficiency.toFixed(1)}%
                      </div>
                      <div className="efficiency-label">Efficiency</div>
                    </div>
                  </div>
                  
                  <div className="item-analysis-footer">
                    <div className="performance-indicator">
                      {data.efficiency >= 80 ? 'Excellent' :
                       data.efficiency >= 60 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section-enhanced">
        <div className="filter-section-header">
          <FiFilter size={18} />
          <h3>Filter Records</h3>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">
              <FiSearch />
              Search Records
            </label>
            <input
              type="text"
              placeholder="Search by machine, operator, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input-enhanced"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <FiFilter />
              Filter by Shift
            </label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="filter-select-enhanced"
            >
              <option value="">All Shifts</option>
              {uniqueShiftCodes.map(shiftCode => (
                <option key={shiftCode} value={shiftCode}>
                  {shiftCode}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <FiCal />
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
              className="filter-date-enhanced"
            />
          </div>

          <div className="filter-actions">
            <button
              onClick={() => {
                if (!filterDate) {
                  alert('Please select a date first to generate report');
                  return;
                }
                setShowReport(true);
              }}
              className="report-btn-enhanced"
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
              className="clear-btn-enhanced"
            >
              <FiXIcon /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report Section */}
      {showReport && reportData && (
        <div className="report-section-enhanced">
          <div className="report-bg-pattern" />
          
          <div className="report-header-enhanced">
            <div className="report-title-section">
              <h2>Flattening Section Daily Report</h2>
              <div className="report-date-enhanced">
                <FiCalendar />
                {reportData.formattedDate}
              </div>
            </div>
            <div className="report-actions-enhanced">
              <button
                onClick={handlePrintReport}
                className="print-btn-enhanced"
              >
                <FiPrinter /> Print Report
              </button>
              <button
                onClick={handleExportReport}
                className="export-report-btn-enhanced"
              >
                <FiDownload /> Export Report
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="close-report-btn-enhanced"
              >
                <FiXIcon /> Close
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="report-content">
            {/* Summary Cards */}
            <div className="report-summary-cards">
              <div className="summary-card">
                <div className="summary-icon">
                  <FiPackage />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Total Production</div>
                  <div className="summary-value">{reportData.totalProduction.toFixed(1)} KG</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">
                  <FiTarget />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Total Target</div>
                  <div className="summary-value">{reportData.totalTarget.toFixed(1)} KG</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">
                  <FiActivity />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Overall Efficiency</div>
                  <div className="summary-value" style={{ 
                    color: reportData.overallEfficiency >= 80 ? '#10b981' :
                           reportData.overallEfficiency >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {reportData.overallEfficiency.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">
                  <FiDatabase />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Total Records</div>
                  <div className="summary-value">{reportData.recordCount}</div>
                </div>
              </div>
            </div>

            {/* Shift-wise Production */}
            {Object.keys(reportData.shiftGroups).length > 0 && (
              <div className="report-section-block">
                <h3>Shift-wise Production</h3>
                <div className="shift-report-grid">
                  {Object.entries(reportData.shiftGroups).map(([shift, data]) => (
                    <div key={shift} className="shift-report-card">
                      <div className="shift-report-header">
                        <div className="shift-name">Shift {shift}</div>
                        <div className={`shift-status ${data.efficiency >= 80 ? 'status-good' : data.efficiency >= 60 ? 'status-average' : 'status-poor'}`}>
                          {data.efficiency >= 80 ? 'Excellent' :
                           data.efficiency >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                      <div className="shift-report-stats">
                        <div className="stat-item">
                          <div className="stat-label">Production</div>
                          <div className="stat-value">{data.production.toFixed(1)} KG</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">Target</div>
                          <div className="stat-value">{data.target.toFixed(1)} KG</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">Efficiency</div>
                          <div className="stat-value" style={{ 
                            color: data.efficiency >= 80 ? '#10b981' :
                                   data.efficiency >= 60 ? '#f59e0b' : '#ef4444'
                          }}>
                            {data.efficiency.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Machine-wise Production */}
            {Object.keys(reportData.machineProduction).length > 0 && (
              <div className="report-section-block">
                <h3>Machine-wise Production</h3>
                <div className="machine-report-list">
                  {Object.entries(reportData.machineProduction)
                    .sort(([a], [b]) => {
                      const numA = parseInt(a.replace(/\D/g, '')) || 0;
                      const numB = parseInt(b.replace(/\D/g, '')) || 0;
                      return numA - numB;
                    })
                    .map(([machine, data]) => (
                    <div key={machine} className="machine-report-item">
                      <div className="machine-report-header">
                        <div className="machine-report-name">
                          <FiTool size={14} />
                          {machine}
                        </div>
                        <div className="machine-report-efficiency">
                          {data.efficiency.toFixed(1)}%
                        </div>
                      </div>
                      <div className="machine-report-details">
                        <div className="detail-item">
                          <span className="detail-label">Production:</span>
                          <span className="detail-value">{data.production.toFixed(1)} KG</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className={`detail-status ${data.efficiency >= 80 ? 'status-good' : data.efficiency >= 60 ? 'status-average' : 'status-poor'}`}>
                            {data.efficiency >= 80 ? 'Excellent' :
                             data.efficiency >= 60 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="report-footer-enhanced">
            <div className="report-footer-content">
              <div className="footer-info">
                <span>Report generated on {new Date().toLocaleString()}</span>
                <span>•</span>
                <span>Data source: flatteningsection table</span>
                <span>•</span>
                <span>ERP Management System</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Table Section */}
      <div className="records-table-section-enhanced">
        <div className="table-header-section">
          <div className="table-header-left">
            <h2>Production Records</h2>
            <div className="table-stats">
              <span className="stat-item">
                <FiDatabase /> Total: {records.length} records
              </span>
              <span className="stat-item">
                <FiFilter /> Showing: {filteredRecords.length} filtered
              </span>
              <span className="stat-item">
                <FiHash /> Page: {currentPage}/{totalPages}
              </span>
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
            <div className="loading-text">Loading production records...</div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-records">
            <div className="empty-icon">
              <FiPackage size={48} />
            </div>
            <div className="empty-content">
              <h3>No records found</h3>
              <p>
                {searchTerm || filterDate || filterShift 
                  ? 'No records match your search criteria. Try adjusting your filters.'
                  : 'No production records available. Create your first record to get started.'}
              </p>
              <button
                onClick={() => setShowFlatteningModal(true)}
                className="create-first-btn"
              >
                <FiPlus /> Create First Record
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="table-container-enhanced">
              <table className="production-table-enhanced">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Machine</th>
                    <th>Item Details</th>
                    <th>Production (KG)</th>
                    <th>Target (KG)</th>
                    <th>Shift</th>
                    <th>Operator</th>
                    <th>Efficiency</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => {
                    const target = getTargetForRecord(record);
                    const efficiency = record.efficiency ? parseFloat(record.efficiency) : 0;
                    const isEfficiencyGood = efficiency >= 80;
                    const isEfficiencyAverage = efficiency >= 60 && efficiency < 80;
                    
                    return (
                      <tr key={record.id} className={index % 2 === 0 ? 'even' : 'odd'}>
                        <td className="id-cell">#{record.id}</td>
                        <td>
                          <div className="machine-cell">
                            <div className="machine-icon">
                              <FiTool size={14} />
                            </div>
                            <div className="machine-details">
                              <div className="machine-id">{record.machine_id || 'N/A'}</div>
                              <div className="machine-number">No: {record.machine_no || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="item-cell">
                            <div className="item-icon">
                              <FiPackage size={14} />
                            </div>
                            <div className="item-details">
                              <div className="item-name">{record.item_name || 'N/A'}</div>
                              <div className="item-size">Size: {record.coil_size || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="production-cell">
                          <div className="production-badge">
                            <div className="production-value">
                              {parseFloat(record.production_quantity).toLocaleString()}
                            </div>
                            <div className="production-label">KG</div>
                          </div>
                        </td>
                        <td className="target-cell">
                          <div className="target-badge">
                            <div className="target-value">
                              {target.toLocaleString()}
                            </div>
                            <div className="target-label">KG</div>
                          </div>
                        </td>
                        <td>
                          <div className={`shift-badge ${record.shift_code || record.shift || 'default'}`}>
                            {record.shift_code || record.shift || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="operator-cell">
                            <div className="operator-avatar">
                              {record.operator_name?.charAt(0) || 'U'}
                            </div>
                            <div className="operator-details">
                              <div className="operator-name">{record.operator_name || 'Unknown'}</div>
                              <div className="operator-role">Operator</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`efficiency-cell ${isEfficiencyGood ? 'good' : isEfficiencyAverage ? 'average' : 'poor'}`}>
                            <div className="efficiency-value">
                              {efficiency ? `${efficiency.toFixed(1)}%` : 'N/A'}
                            </div>
                            <div className="efficiency-indicator">
                              {isEfficiencyGood && <FiArrowUp size={12} />}
                              {isEfficiencyAverage && <FiCircle size={12} />}
                              {!isEfficiencyGood && !isEfficiencyAverage && <FiArrowDown size={12} />}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="datetime-cell">
                            <div className="date-part">
                              <FiCalendar size={12} />
                              {new Date(record.created_at).toLocaleDateString('en-GB')}
                            </div>
                            <div className="time-part">
                              <FiClock size={12} />
                              {new Date(record.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              onClick={() => handleView(record.id)}
                              className="view-btn"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              onClick={() => handleEdit(record.id)}
                              className="edit-btn"
                              title="Edit Record"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="delete-btn"
                              title="Delete Record"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-section-enhanced">
                <div className="pagination-info">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
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
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="page-dots">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`page-number ${currentPage === totalPages ? 'active' : ''}`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
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
      <div className="page-footer-enhanced">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-title">
              Flattening Section • Production Management System
            </div>
            <div className="footer-subtitle">
              Database: flatteningsection table • Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-status">
              <div className={`database-status ${isSupabaseConnected ? 'connected' : 'offline'}`}>
                <div className="status-dot" />
                {isSupabaseConnected ? 'Connected to Database' : 'Database Offline'}
              </div>
              <div className="footer-stats">
                {stats.totalRecords} records • {stats.todayProduction} KG today • {stats.totalProduction.toLocaleString()} KG total
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button
            onClick={() => setShowFlatteningModal(true)}
            className="footer-btn add-btn"
          >
            <FiPlus /> Add New Record
          </button>
          <button
            onClick={fetchData}
            className="footer-btn refresh-btn"
          >
            <FiRefreshCw /> Refresh Data
          </button>
          <button
            onClick={() => navigate('/production')}
            className="footer-btn production-btn"
          >
            <FiGrid /> Production Sections
          </button>
        </div>
      </div>

      {/* Flattening Form Modal */}
      {showFlatteningModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <FlatteningForm 
              isModal={true}
              onClose={() => {
                setShowFlatteningModal(false);
                fetchData();
              }}
              onSuccess={() => {
                setShowFlatteningModal(false);
                fetchData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlatteningPage;