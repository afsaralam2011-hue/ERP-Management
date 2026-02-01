// src/data/productionData.js
const departmentsData = {
  // Raw Material Section
  'Raw Material Section': {
    id: 1,
    name: 'Raw Material Section',
    tableName: 'raw_material_log',
    unit: 'KG',
    color: '#f59e0b',
    machines: [
      { id: 'RM-001', name: 'Weighing Machine 1', type: 'Weighing', status: 'Running' },
      { id: 'RM-002', name: 'Weighing Machine 2', type: 'Weighing', status: 'Running' },
      { id: 'RM-003', name: 'Quality Check Station', type: 'QC', status: 'Maintenance' }
    ],
    shifts: ['Shift A (8AM- 4PM)', 'Shift B (4PM-12AM)', 'Shift C (12AM-8AM)'],
    items: ['Steel Coil', 'Copper Wire', 'PVC Compound', 'Packaging Material'],
    
    // Weekly Data
    weeklyProduction: [
      { day: 'Mon', production: 12500, target: 13000 },
      { day: 'Tue', production: 13500, target: 13000 },
      { day: 'Wed', production: 12800, target: 13000 },
      { day: 'Thu', production: 14200, target: 14000 },
      { day: 'Fri', production: 13800, target: 14000 },
      { day: 'Sat', production: 11000, target: 12000 },
      { day: 'Sun', production: 9500, target: 10000 }
    ],
    
    // Machine-wise Data
    machineData: [
      { machine: 'RM-001', shiftA: 4200, shiftB: 3800, shiftC: 3100, total: 11100 },
      { machine: 'RM-002', shiftA: 4100, shiftB: 3950, shiftC: 3200, total: 11250 },
      { machine: 'RM-003', shiftA: 200, shiftB: 150, shiftC: 0, total: 350 }
    ],
    
    // Item-wise Data
    itemData: [
      { item: 'Steel Coil', quantity: 18500, unit: 'KG', percentage: 45 },
      { item: 'Copper Wire', quantity: 9800, unit: 'KG', percentage: 24 },
      { item: 'PVC Compound', quantity: 7500, unit: 'KG', percentage: 18 },
      { item: 'Packaging Material', quantity: 4800, unit: 'KG', percentage: 12 }
    ],
    
    // Daily Stats
    dailyStats: {
      todayProduction: 14500,
      yesterdayProduction: 13800,
      efficiency: 94.5,
      downtime: 1.8,
      qualityRate: 99.2
    }
  },
  
  // Flatting Section
  'Flatting Section': {
    id: 2,
    name: 'Flatting Section',
    tableName: 'flatteningsection',
    unit: 'KG',
    color: '#3b82f6',
    machines: [
      { id: 'FLT-001', name: 'Flattening Press 1', type: 'Press', status: 'Running' },
      { id: 'FLT-002', name: 'Flattening Press 2', type: 'Press', status: 'Running' },
      { id: 'FLT-003', name: 'Rolling Machine 1', type: 'Rolling', status: 'Running' },
      { id: 'FLT-004', name: 'Rolling Machine 2', type: 'Rolling', status: 'Idle' }
    ],
    shifts: ['Shift A', 'Shift B', 'Shift C'],
    items: ['Flat Bar 10mm', 'Flat Bar 12mm', 'Flat Bar 16mm', 'Flat Bar 20mm'],
    
    weeklyProduction: [
      { day: 'Mon', production: 2850, target: 3000 },
      { day: 'Tue', production: 3200, target: 3000 },
      { day: 'Wed', production: 2750, target: 3000 },
      { day: 'Thu', production: 3100, target: 3000 },
      { day: 'Fri', production: 2950, target: 3000 },
      { day: 'Sat', production: 2650, target: 2500 },
      { day: 'Sun', production: 1850, target: 2000 }
    ],
    
    machineData: [
      { machine: 'FLT-001', shiftA: 950, shiftB: 850, shiftC: 700, total: 2500 },
      { machine: 'FLT-002', shiftA: 920, shiftB: 830, shiftC: 690, total: 2440 },
      { machine: 'FLT-003', shiftA: 880, shiftB: 790, shiftC: 650, total: 2320 },
      { machine: 'FLT-004', shiftA: 100, shiftB: 0, shiftC: 0, total: 100 }
    ],
    
    itemData: [
      { item: 'Flat Bar 10mm', quantity: 4200, unit: 'KG', percentage: 35 },
      { item: 'Flat Bar 12mm', quantity: 3800, unit: 'KG', percentage: 32 },
      { item: 'Flat Bar 16mm', quantity: 2800, unit: 'KG', percentage: 23 },
      { item: 'Flat Bar 20mm', quantity: 1200, unit: 'KG', percentage: 10 }
    ],
    
    dailyStats: {
      todayProduction: 3100,
      yesterdayProduction: 2950,
      efficiency: 92.8,
      downtime: 2.1,
      qualityRate: 98.5
    }
  },
  
  // Spiral Section
  'Spiral Section': {
    id: 3,
    name: 'Spiral Section',
    tableName: 'spiralsection',
    unit: 'Meter',
    color: '#8b5cf6',
    machines: [
      { id: 'SPR-001', name: 'Spiral Machine 1', type: 'Spiral', status: 'Running' },
      { id: 'SPR-002', name: 'Spiral Machine 2', type: 'Spiral', status: 'Running' },
      { id: 'SPR-003', name: 'Spiral Machine 3', type: 'Spiral', status: 'Maintenance' }
    ],
    shifts: ['Morning Shift', 'Evening Shift', 'Night Shift'],
    items: ['Spiral Pipe 4"', 'Spiral Pipe 6"', 'Spiral Pipe 8"', 'Spiral Pipe 10"'],
    
    weeklyProduction: [
      { day: 'Mon', production: 1250, target: 1200 },
      { day: 'Tue', production: 1380, target: 1200 },
      { day: 'Wed', production: 1150, target: 1200 },
      { day: 'Thu', production: 1420, target: 1300 },
      { day: 'Fri', production: 1280, target: 1300 },
      { day: 'Sat', production: 950, target: 1000 },
      { day: 'Sun', production: 750, target: 800 }
    ],
    
    machineData: [
      { machine: 'SPR-001', shiftA: 450, shiftB: 420, shiftC: 380, total: 1250 },
      { machine: 'SPR-002', shiftA: 430, shiftB: 410, shiftC: 360, total: 1200 },
      { machine: 'SPR-003', shiftA: 50, shiftB: 0, shiftC: 0, total: 50 }
    ],
    
    itemData: [
      { item: 'Spiral Pipe 4"', quantity: 2100, unit: 'Meter', percentage: 40 },
      { item: 'Spiral Pipe 6"', quantity: 1600, unit: 'Meter', percentage: 30 },
      { item: 'Spiral Pipe 8"', quantity: 1050, unit: 'Meter', percentage: 20 },
      { item: 'Spiral Pipe 10"', quantity: 550, unit: 'Meter', percentage: 10 }
    ],
    
    dailyStats: {
      todayProduction: 1420,
      yesterdayProduction: 1280,
      efficiency: 91.5,
      downtime: 3.2,
      qualityRate: 97.8
    }
  },
  
  // PVC Coating Section
  'PVC Coating Section': {
    id: 4,
    name: 'PVC Coating Section',
    tableName: 'pvcsection',
    unit: 'Meter',
    color: '#10b981',
    machines: [
      { id: 'PVC-001', name: 'PVC Coater 1', type: 'Coating', status: 'Running' },
      { id: 'PVC-002', name: 'PVC Coater 2', type: 'Coating', status: 'Running' },
      { id: 'PVC-003', name: 'Drying Oven', type: 'Drying', status: 'Running' }
    ],
    shifts: ['Shift 1', 'Shift 2', 'Shift 3'],
    items: ['PVC Coated Pipe 4"', 'PVC Coated Pipe 6"', 'PVC Coated Pipe 8"'],
    
    weeklyProduction: [
      { day: 'Mon', production: 850, target: 800 },
      { day: 'Tue', production: 920, target: 800 },
      { day: 'Wed', production: 780, target: 800 },
      { day: 'Thu', production: 950, target: 900 },
      { day: 'Fri', production: 880, target: 900 },
      { day: 'Sat', production: 650, target: 700 },
      { day: 'Sun', production: 520, target: 600 }
    ],
    
    machineData: [
      { machine: 'PVC-001', shiftA: 320, shiftB: 300, shiftC: 280, total: 900 },
      { machine: 'PVC-002', shiftA: 310, shiftB: 290, shiftC: 270, total: 870 },
      { machine: 'PVC-003', shiftA: 220, shiftB: 210, shiftC: 200, total: 630 }
    ],
    
    itemData: [
      { item: 'PVC Coated Pipe 4"', quantity: 2800, unit: 'Meter', percentage: 50 },
      { item: 'PVC Coated Pipe 6"', quantity: 1680, unit: 'Meter', percentage: 30 },
      { item: 'PVC Coated Pipe 8"', quantity: 1120, unit: 'Meter', percentage: 20 }
    ],
    
    dailyStats: {
      todayProduction: 950,
      yesterdayProduction: 880,
      efficiency: 89.7,
      downtime: 4.5,
      qualityRate: 96.5
    }
  },
  
  // Cutting & Packing Section
  'Cutting & Packing Section': {
    id: 5,
    name: 'Cutting & Packing Section',
    tableName: 'cuttingpacking',
    unit: 'Meter',
    color: '#ec4899',
    machines: [
      { id: 'CT-001', name: 'Cutting Machine 1', type: 'Cutting', status: 'Running' },
      { id: 'CT-002', name: 'Cutting Machine 2', type: 'Cutting', status: 'Running' },
      { id: 'PK-001', name: 'Packing Station 1', type: 'Packing', status: 'Running' },
      { id: 'PK-002', name: 'Packing Station 2', type: 'Packing', status: 'Idle' }
    ],
    shifts: ['Day Shift', 'Night Shift'],
    items: ['Cut Pipe 6ft', 'Cut Pipe 8ft', 'Cut Pipe 10ft', 'Packed Bundle'],
    
    weeklyProduction: [
      { day: 'Mon', production: 1200, target: 1100 },
      { day: 'Tue', production: 1350, target: 1100 },
      { day: 'Wed', production: 1150, target: 1100 },
      { day: 'Thu', production: 1250, target: 1200 },
      { day: 'Fri', production: 1300, target: 1200 },
      { day: 'Sat', production: 950, target: 900 },
      { day: 'Sun', production: 750, target: 700 }
    ],
    
    machineData: [
      { machine: 'CT-001', shiftA: 650, shiftB: 620, total: 1270 },
      { machine: 'CT-002', shiftA: 630, shiftB: 610, total: 1240 },
      { machine: 'PK-001', shiftA: 1250, shiftB: 1200, total: 2450 },
      { machine: 'PK-002', shiftA: 150, shiftB: 0, total: 150 }
    ],
    
    itemData: [
      { item: 'Cut Pipe 6ft', quantity: 4200, unit: 'Meter', percentage: 40 },
      { item: 'Cut Pipe 8ft', quantity: 3150, unit: 'Meter', percentage: 30 },
      { item: 'Cut Pipe 10ft', quantity: 2100, unit: 'Meter', percentage: 20 },
      { item: 'Packed Bundle', quantity: 1050, unit: 'Meter', percentage: 10 }
    ],
    
    dailyStats: {
      todayProduction: 1250,
      yesterdayProduction: 1300,
      efficiency: 95.2,
      downtime: 1.5,
      qualityRate: 99.1
    }
  },
  
  // Finishing Goods Section
  'Finishing Goods Section': {
    id: 6,
    name: 'Finishing Goods Section',
    tableName: 'finishinggoods',
    unit: 'Meter',
    color: '#06b6d4',
    machines: [
      { id: 'FG-001', name: 'Finishing Machine 1', type: 'Finishing', status: 'Running' },
      { id: 'FG-002', name: 'Finishing Machine 2', type: 'Finishing', status: 'Running' },
      { id: 'QC-001', name: 'Final QC Station', type: 'QC', status: 'Running' }
    ],
    shifts: ['First Shift', 'Second Shift'],
    items: ['Finished Pipe 4"', 'Finished Pipe 6"', 'Finished Pipe 8"', 'Finished Pipe 10"'],
    
    weeklyProduction: [
      { day: 'Mon', production: 2000, target: 1800 },
      { day: 'Tue', production: 2150, target: 1800 },
      { day: 'Wed', production: 1950, target: 1800 },
      { day: 'Thu', production: 2250, target: 2000 },
      { day: 'Fri', production: 2100, target: 2000 },
      { day: 'Sat', production: 1650, target: 1500 },
      { day: 'Sun', production: 1350, target: 1200 }
    ],
    
    machineData: [
      { machine: 'FG-001', shiftA: 1100, shiftB: 1050, total: 2150 },
      { machine: 'FG-002', shiftA: 1080, shiftB: 1020, total: 2100 },
      { machine: 'QC-001', shiftA: 2100, shiftB: 2000, total: 4100 }
    ],
    
    itemData: [
      { item: 'Finished Pipe 4"', quantity: 5600, unit: 'Meter', percentage: 40 },
      { item: 'Finished Pipe 6"', quantity: 4200, unit: 'Meter', percentage: 30 },
      { item: 'Finished Pipe 8"', quantity: 2800, unit: 'Meter', percentage: 20 },
      { item: 'Finished Pipe 10"', quantity: 1400, unit: 'Meter', percentage: 10 }
    ],
    
    dailyStats: {
      todayProduction: 2250,
      yesterdayProduction: 2100,
      efficiency: 97.8,
      downtime: 0.8,
      qualityRate: 99.5
    }
  }
};

export const getDepartmentData = (departmentName) => {
  return departmentsData[departmentName] || departmentsData['Flatting Section'];
};

export const getAllDepartments = () => {
  return Object.values(departmentsData).map(dept => ({
    id: dept.id,
    name: dept.name,
    color: dept.color,
    unit: dept.unit,
    tableName: dept.tableName
  }));
};