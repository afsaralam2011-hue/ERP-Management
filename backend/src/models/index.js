import User from './User.js';
import RawMaterialLog from './RawMaterialLog.js';

// Define relationships if any
// Example: User.hasMany(RawMaterialLog, { foreignKey: 'created_by' });
// RawMaterialLog.belongsTo(User, { foreignKey: 'created_by' });

const models = {
  User,
  RawMaterialLog
};

export default models;