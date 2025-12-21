// src/pages/ProductionSections/ProductionSections.jsx میں
const productionSections = [
  {
    id: 'raw-material',
    title: 'Raw Material Section',
    description: 'Raw material stock, usage, and management',
    icon: FiArchive,
    color: '#06b6d4',
    path: '/production-sections/raw-material',
    status: 'active',
    stats: { records: 0, production: 0, efficiency: 0 }
  },
  {
    id: 'flattening',
    title: 'Flattening Section',
    description: 'Wire flattening process management',
    icon: FiPackage,
    color: '#10b981',
    path: '/production-sections/flattening',
    status: 'active',
    stats: { records: 0, production: 0, efficiency: 0 }
  },
  {
    id: 'spiral',
    title: 'Spiral Section',
    description: 'Spiral binding production management',
    icon: FiColumns,
    color: '#3b82f6',
    path: '/production-sections/spiral',
    status: 'active',
    stats: { records: 0, production: 0, efficiency: 0 }
  },
  {
    id: 'pvc-coating',
    title: 'PVC Coating Section',
    description: 'PVC coating process and production management',
    icon: FiLayers,
    color: '#8b5cf6',
    path: '/production-sections/pvc-coating',
    status: 'active',
    stats: { records: 0, production: 0, efficiency: 0 }
  },
  {
    id: 'cutting-packing',
    title: 'Cutting & Packing Section',
    description: 'Cutting and packing process management',
    icon: FiScissors,
    color: '#f59e0b',
    path: '#',
    status: 'coming-soon',
    stats: { records: 0, production: 0, efficiency: 0 }
  },
  {
    id: 'finished-goods',
    title: 'Finished Goods Section',
    description: 'Finished goods storage and management',
    icon: FiCheckSquare,
    color: '#ec4899',
    path: '#',
    status: 'coming-soon',
    stats: { records: 0, production: 0, efficiency: 0 }
  }
];