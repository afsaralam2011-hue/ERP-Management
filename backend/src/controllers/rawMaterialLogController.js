import RawMaterialLog from '../models/RawMaterialLog.js';
import { Op } from 'sequelize';

// @desc    Get all raw material logs
// @route   GET /api/raw-material-log
// @access  Private
export const getAllLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      transaction_type = '',
      category = '',
      start_date = '',
      end_date = '',
      status = ''
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {};
    
    // Search condition
    if (search) {
      whereConditions[Op.or] = [
        { gate_pass: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { wire_size: { [Op.iLike]: `%${search}%` } },
        { remarks: { [Op.iLike]: `%${search}%` } },
        { reason: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter conditions
    if (transaction_type) {
      whereConditions.transaction_type = transaction_type;
    }
    
    if (category) {
      whereConditions.category = category;
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Date range filter
    if (start_date && end_date) {
      whereConditions.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      whereConditions.created_at = {
        [Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      whereConditions.created_at = {
        [Op.lte]: new Date(end_date)
      };
    }

    const { count, rows } = await RawMaterialLog.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single raw material log
// @route   GET /api/raw-material-log/:id
// @access  Private
export const getLogById = async (req, res) => {
  try {
    const log = await RawMaterialLog.findByPk(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get log by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new raw material log
// @route   POST /api/raw-material-log
// @access  Private
export const createLog = async (req, res) => {
  try {
    const {
      gate_pass,
      transaction_type,
      wire_size,
      category,
      shape,
      kg_wt,
      remarks,
      reason,
      department,
      reference_no,
      received_by,
      issued_by,
      status
    } = req.body;

    // Check if gate_pass already exists
    const existingLog = await RawMaterialLog.findOne({ where: { gate_pass } });
    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: 'Gate pass number already exists'
      });
    }

    const logData = {
      gate_pass,
      transaction_type,
      wire_size,
      category,
      shape,
      kg_wt: parseFloat(kg_wt),
      remarks,
      reason,
      department,
      reference_no,
      received_by,
      issued_by,
      status: status || 'active',
      created_by: req.user?.name || req.user?.username || 'System',
      updated_by: req.user?.name || req.user?.username || 'System'
    };

    const newLog = await RawMaterialLog.create(logData);

    res.status(201).json({
      success: true,
      message: 'Raw material log created successfully',
      data: newLog
    });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update raw material log
// @route   PUT /api/raw-material-log/:id
// @access  Private
export const updateLog = async (req, res) => {
  try {
    const log = await RawMaterialLog.findByPk(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    const {
      gate_pass,
      transaction_type,
      wire_size,
      category,
      shape,
      kg_wt,
      remarks,
      reason,
      department,
      reference_no,
      received_by,
      issued_by,
      status
    } = req.body;

    // Check if gate_pass is being changed and already exists
    if (gate_pass && gate_pass !== log.gate_pass) {
      const existingLog = await RawMaterialLog.findOne({ where: { gate_pass } });
      if (existingLog) {
        return res.status(400).json({
          success: false,
          message: 'Gate pass number already exists'
        });
      }
    }

    const updateData = {
      gate_pass: gate_pass || log.gate_pass,
      transaction_type: transaction_type || log.transaction_type,
      wire_size: wire_size || log.wire_size,
      category: category || log.category,
      shape: shape || log.shape,
      kg_wt: kg_wt ? parseFloat(kg_wt) : log.kg_wt,
      remarks: remarks !== undefined ? remarks : log.remarks,
      reason: reason !== undefined ? reason : log.reason,
      department: department !== undefined ? department : log.department,
      reference_no: reference_no !== undefined ? reference_no : log.reference_no,
      received_by: received_by !== undefined ? received_by : log.received_by,
      issued_by: issued_by !== undefined ? issued_by : log.issued_by,
      status: status || log.status,
      updated_by: req.user?.name || req.user?.username || 'System'
    };

    await log.update(updateData);

    res.json({
      success: true,
      message: 'Raw material log updated successfully',
      data: log
    });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete raw material log
// @route   DELETE /api/raw-material-log/:id
// @access  Private
export const deleteLog = async (req, res) => {
  try {
    const log = await RawMaterialLog.findByPk(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    await log.destroy();

    res.json({
      success: true,
      message: 'Raw material log deleted successfully'
    });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get statistics
// @route   GET /api/raw-material-log/stats/overview
// @access  Private
export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Total records count
    const totalRecords = await RawMaterialLog.count();
    
    // Today's records
    const todayRecords = await RawMaterialLog.count({
      where: {
        created_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });
    
    // Yesterday's records
    const yesterdayRecords = await RawMaterialLog.count({
      where: {
        created_at: {
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    });
    
    // This month records
    const thisMonthRecords = await RawMaterialLog.count({
      where: {
        created_at: {
          [Op.gte]: thisMonth,
          [Op.lt]: nextMonth
        }
      }
    });

    // Total weight
    const totalWeightResult = await RawMaterialLog.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('kg_wt')), 'total_weight']
      ]
    });
    const totalWeight = parseFloat(totalWeightResult?.dataValues?.total_weight || 0);
    
    // Today's weight
    const todayWeightResult = await RawMaterialLog.findOne({
      where: {
        created_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('kg_wt')), 'today_weight']
      ]
    });
    const todayWeight = parseFloat(todayWeightResult?.dataValues?.today_weight || 0);
    
    // Transaction type counts
    const transactionCounts = await RawMaterialLog.findAll({
      attributes: [
        'transaction_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('kg_wt')), 'total_weight']
      ],
      group: ['transaction_type']
    });

    // Category wise counts
    const categoryCounts = await RawMaterialLog.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('kg_wt')), 'total_weight']
      ],
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('kg_wt')), 'DESC']],
      limit: 5
    });

    // Status counts
    const statusCounts = await RawMaterialLog.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Recent logs (last 5)
    const recentLogs = await RawMaterialLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'gate_pass', 'transaction_type', 'wire_size', 'kg_wt', 'created_at']
    });

    res.json({
      success: true,
      data: {
        totals: {
          records: totalRecords,
          weight: totalWeight.toFixed(2)
        },
        today: {
          records: todayRecords,
          weight: todayWeight.toFixed(2)
        },
        yesterday: {
          records: yesterdayRecords
        },
        thisMonth: {
          records: thisMonthRecords
        },
        transactionTypes: transactionCounts,
        categories: categoryCounts,
        statuses: statusCounts,
        recentLogs
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/raw-material-log/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    // Total counts
    const totalRecords = await RawMaterialLog.count();
    const activeRecords = await RawMaterialLog.count({ where: { status: 'active' } });
    const receivedCount = await RawMaterialLog.count({ where: { transaction_type: 'material received' } });
    const issuedCount = await RawMaterialLog.count({ where: { transaction_type: 'material issue' } });

    // Weight calculations
    const totalWeightResult = await RawMaterialLog.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('kg_wt')), 'total']]
    });
    const totalWeight = parseFloat(totalWeightResult?.dataValues?.total || 0);

    const todayWeightResult = await RawMaterialLog.findOne({
      where: { created_at: { [Op.gte]: today } },
      attributes: [[sequelize.fn('SUM', sequelize.col('kg_wt')), 'total']]
    });
    const todayWeight = parseFloat(todayWeightResult?.dataValues?.total || 0);

    const yesterdayWeightResult = await RawMaterialLog.findOne({
      where: { 
        created_at: { 
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('kg_wt')), 'total']]
    });
    const yesterdayWeight = parseFloat(yesterdayWeightResult?.dataValues?.total || 0);

    // Last 7 days data for chart
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const dayData = await RawMaterialLog.findOne({
        where: { created_at: { [Op.between]: [start, end] } },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('kg_wt')), 'weight']
        ]
      });

      last7DaysData.push({
        date: date.toISOString().split('T')[0],
        count: parseInt(dayData?.dataValues?.count || 0),
        weight: parseFloat(dayData?.dataValues?.weight || 0)
      });
    }

    res.json({
      success: true,
      data: {
        totalRecords,
        activeRecords,
        receivedCount,
        issuedCount,
        totalWeight: totalWeight.toFixed(2),
        todayWeight: todayWeight.toFixed(2),
        yesterdayWeight: yesterdayWeight.toFixed(2),
        last7Days: last7DaysData
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};