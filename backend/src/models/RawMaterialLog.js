import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const RawMaterialLog = sequelize.define('RawMaterialLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  gate_pass: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  transaction_type: {
    type: DataTypes.ENUM('material received', 'material issue', 'transfer', 'return', 'adjustment'),
    allowNull: false,
    defaultValue: 'material received'
  },
  wire_size: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  shape: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  kg_wt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  reference_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  received_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  issued_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'on_hold', 'pending'),
    defaultValue: 'active'
  },
  created_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  updated_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'raw_material_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Model methods
RawMaterialLog.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Format decimal values
  if (values.kg_wt) {
    values.kg_wt = parseFloat(values.kg_wt);
  }
  
  // Format dates
  if (values.created_at) {
    values.created_at = new Date(values.created_at).toISOString();
  }
  if (values.updated_at) {
    values.updated_at = new Date(values.updated_at).toISOString();
  }
  
  return values;
};

export default RawMaterialLog;