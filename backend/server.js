// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.json({
    message: "Pakistan Wire Industries ERP System Backend API is running",
    status: "success",
    timestamp: new Date().toISOString(),
    company: "Pakistan Wire Industries Ltd."
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: "OK",
    service: "Pakistan Wire Industries ERP System API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: "Test API is working perfectly",
    data: {
      version: "1.0.0",
      company: "Pakistan Wire Industries",
      features: ["authentication", "production", "notifications", "dashboard"]
    }
  });
});

// Manifest route
app.get('/manifest.json', (req, res) => {
  res.json({
    "name": "Pakistan Wire Industries ERP",
    "short_name": "PWI ERP",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#1E40AF",
    "background_color": "#ffffff"
  });
});

// ========== AUTH APIs ==========
// Register API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: Date.now(),
        firstName,
        lastName,
        email,
        role: 'user',
        department: 'General'
      },
      token: 'dummy-jwt-token-' + Date.now()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (email === 'admin@pwi.com' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@pwi.com',
          role: 'admin',
          department: 'Administration'
        },
        token: 'admin-jwt-token'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 2,
        firstName: 'Production',
        lastName: 'Manager',
        email: email,
        role: 'manager',
        department: 'Production'
      },
      token: 'user-jwt-token-' + Date.now()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Users list API
app.get('/api/users', async (req, res) => {
  try {
    const users = [
      {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@pwi.com',
        role: 'admin',
        department: 'Administration',
        createdAt: new Date()
      },
      {
        id: 2,
        firstName: 'Production',
        lastName: 'Manager',
        email: 'production@pwi.com',
        role: 'manager',
        department: 'Production',
        createdAt: new Date()
      },
      {
        id: 3,
        firstName: 'Flattening',
        lastName: 'Supervisor',
        email: 'flattening@pwi.com',
        role: 'supervisor',
        department: 'Flattening',
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// ========== NOTIFICATIONS APIs ==========
// Get all notifications
app.get('/api/notifications', (req, res) => {
  console.log('📢 Notifications API called - Pakistan Wire Industries');
  
  const notifications = [
    {
      id: 1,
      message: 'Pakistan Wire Industries ERP System Initialized Successfully',
      type: 'info',
      read: false,
      time: new Date().toISOString(),
      section: 'System',
      priority: 'high'
    },
    {
      id: 2,
      message: 'Production: Flattening section achieved daily target - 1500 kg',
      type: 'production',
      read: false,
      time: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      section: 'Flattening',
      priority: 'medium'
    },
    {
      id: 3,
      message: 'Raw Material: Copper wire stock needs replenishment',
      type: 'warning',
      read: false,
      time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      section: 'Raw Material',
      priority: 'high'
    },
    {
      id: 4,
      message: 'Maintenance: Machine FLT-001 maintenance completed',
      type: 'info',
      read: true,
      time: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      section: 'Maintenance',
      priority: 'low'
    },
    {
      id: 5,
      message: 'Quality Check: Batch #245 passed all quality tests',
      type: 'success',
      read: true,
      time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      section: 'Quality',
      priority: 'medium'
    },
    {
      id: 6,
      message: 'New employee: Muhammad Ali joined as Production Operator',
      type: 'info',
      read: false,
      time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      section: 'HR',
      priority: 'low'
    }
  ];

  res.json({
    success: true,
    message: 'Notifications fetched successfully',
    timestamp: new Date().toISOString(),
    company: 'Pakistan Wire Industries Ltd.',
    count: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    data: notifications
  });
});

// Mark notification as read
app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  console.log(`✅ Marking notification ${id} as read`);
  
  res.json({
    success: true,
    message: `Notification ${id} marked as read`,
    timestamp: new Date().toISOString()
  });
});

// Mark all notifications as read
app.put('/api/notifications/mark-all-read', (req, res) => {
  console.log('✅ Marking all notifications as read');
  
  res.json({
    success: true,
    message: 'All notifications marked as read',
    timestamp: new Date().toISOString()
  });
});

// Create new notification
app.post('/api/notifications', (req, res) => {
  const { message, type, section } = req.body;
  console.log('➕ New notification:', { message, type, section });
  
  res.json({
    success: true,
    message: 'Notification added successfully',
    timestamp: new Date().toISOString(),
    notification: {
      id: Date.now(),
      message: message || 'New notification from Pakistan Wire Industries',
      type: type || 'info',
      read: false,
      time: new Date().toISOString(),
      section: section || 'General'
    }
  });
});

// ========== PRODUCTION APIs ==========
// Get all production data
app.get('/api/production', (req, res) => {
  const productionData = [
    {
      id: 1,
      section: "flattening",
      product: "Copper Wire 2mm",
      quantity: 1500,
      unit: "kg",
      machine: "FLT-001",
      operator: "Ali Ahmed",
      date: new Date().toISOString(),
      status: "completed",
      quality: "A+"
    },
    {
      id: 2,
      section: "spiral",
      product: "Spiral Cable 4mm",
      quantity: 800,
      unit: "meters",
      machine: "SPR-002",
      operator: "Kamran Khan",
      date: new Date(Date.now() - 86400000).toISOString(),
      status: "completed",
      quality: "A"
    },
    {
      id: 3,
      section: "pvc",
      product: "PVC Coated Wire",
      quantity: 1200,
      unit: "kg",
      machine: "PVC-003",
      operator: "Sajid Mahmood",
      date: new Date(Date.now() - 172800000).toISOString(),
      status: "in-progress",
      quality: "A"
    }
  ];
  
  res.json({
    success: true,
    company: "Pakistan Wire Industries",
    count: productionData.length,
    data: productionData
  });
});

// Create production entry
app.post('/api/production/entry', async (req, res) => {
  try {
    const { section, product, quantity, unit, machine, operator } = req.body;

    if (!section || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Section and quantity are required'
      });
    }

    const newEntry = {
      id: Date.now(),
      section,
      product: product || "Copper Wire",
      quantity,
      unit: unit || "kg",
      machine: machine || "FLT-001",
      operator: operator || "Production Operator",
      date: new Date().toISOString(),
      status: "completed",
      quality: "A"
    };

    res.json({
      success: true,
      message: 'Production entry created successfully',
      data: newEntry
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create production entry',
      error: error.message
    });
  }
});

// ========== DASHBOARD APIs ==========
// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    company: "Pakistan Wire Industries Ltd.",
    data: {
      totalProduction: 12500,
      todayProduction: 850,
      activeMachines: 8,
      totalEmployees: 45,
      pendingTasks: 12,
      completedToday: 25,
      rawMaterialStock: 4500,
      finishedGoods: 3200
    }
  });
});

// Recent activities
app.get('/api/dashboard/activities', (req, res) => {
  const activities = [
    {
      id: 1,
      type: "production",
      message: "Flattening section: New production entry 1500kg",
      time: "10 minutes ago",
      user: "Ali Ahmed",
      section: "Flattening"
    },
    {
      id: 2,
      type: "maintenance",
      message: "Machine FLT-002 maintenance scheduled",
      time: "1 hour ago",
      user: "Maintenance Team",
      section: "Maintenance"
    },
    {
      id: 3,
      type: "quality",
      message: "Quality check passed for batch #245",
      time: "2 hours ago",
      user: "Quality Control",
      section: "Quality"
    }
  ];
  
  res.json({
    success: true,
    data: activities
  });
});

// ========== MACHINE APIs ==========
// Machine status
app.get('/api/machines', (req, res) => {
  const machines = [
    {
      id: "FLT-001",
      name: "Flattening Machine 1",
      section: "flattening",
      status: "running",
      lastMaintenance: "2024-01-10",
      productionCount: 12500,
      efficiency: "92%"
    },
    {
      id: "FLT-002",
      name: "Flattening Machine 2",
      section: "flattening",
      status: "idle",
      lastMaintenance: "2024-01-05",
      productionCount: 9800,
      efficiency: "88%"
    },
    {
      id: "SPR-001",
      name: "Spiral Machine 1",
      section: "spiral",
      status: "running",
      lastMaintenance: "2024-01-08",
      productionCount: 7500,
      efficiency: "95%"
    }
  ];
  
  res.json({
    success: true,
    data: machines
  });
});

// Report machine error
app.post('/api/machines/error', async (req, res) => {
  try {
    const { machineId, error, section, reportedBy } = req.body;

    if (!machineId || !error) {
      return res.status(400).json({
        success: false,
        message: 'Machine ID and error description are required'
      });
    }

    const errorReport = {
      id: Date.now(),
      machineId,
      error,
      section: section || "unknown",
      reportedBy: reportedBy || "Anonymous",
      timestamp: new Date().toISOString(),
      status: "reported"
    };

    res.json({
      success: true,
      message: 'Machine error reported successfully',
      data: errorReport
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to report machine error',
      error: error.message
    });
  }
});

// ========== INVENTORY APIs ==========
// Raw material inventory
app.get('/api/inventory/raw-material', (req, res) => {
  const rawMaterials = [
    {
      id: 1,
      material: "Copper Wire 8mm",
      quantity: 2500,
      unit: "kg",
      minStock: 1000,
      status: "adequate"
    },
    {
      id: 2,
      material: "PVC Compound",
      quantity: 800,
      unit: "kg",
      minStock: 500,
      status: "low"
    },
    {
      id: 3,
      material: "Steel Wire",
      quantity: 1500,
      unit: "kg",
      minStock: 800,
      status: "adequate"
    }
  ];
  
  res.json({
    success: true,
    data: rawMaterials
  });
});

// Finished goods inventory
app.get('/api/inventory/finished-goods', (req, res) => {
  const finishedGoods = [
    {
      id: 1,
      product: "Flattened Copper Wire 2mm",
      quantity: 3200,
      unit: "kg",
      location: "Warehouse A"
    },
    {
      id: 2,
      product: "Spiral Cable 4mm",
      quantity: 1500,
      unit: "meters",
      location: "Warehouse B"
    },
    {
      id: 3,
      product: "PVC Coated Wire",
      quantity: 2100,
      unit: "kg",
      location: "Warehouse A"
    }
  ];
  
  res.json({
    success: true,
    data: finishedGoods
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`🌐 Home: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`\n👤 Auth APIs:`);
  console.log(`   🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   👥 Users: GET http://localhost:${PORT}/api/users`);
  console.log(`\n🔔 Notification APIs:`);
  console.log(`   📢 All: GET http://localhost:${PORT}/api/notifications`);
  console.log(`   ➕ New: POST http://localhost:${PORT}/api/notifications`);
  console.log(`\n🏭 Production APIs:`);
  console.log(`   📊 All: GET http://localhost:${PORT}/api/production`);
  console.log(`   ➕ New Entry: POST http://localhost:${PORT}/api/production/entry`);
  console.log(`\n📊 Dashboard APIs:`);
  console.log(`   📈 Stats: GET http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`   📋 Activities: GET http://localhost:${PORT}/api/dashboard/activities`);
  console.log(`\n🏗️  Machine APIs:`);
  console.log(`   🔧 All: GET http://localhost:${PORT}/api/machines`);
  console.log(`   ⚠️  Report Error: POST http://localhost:${PORT}/api/machines/error`);
  console.log(`\n📦 Inventory APIs:`);
  console.log(`   📊 Raw Material: GET http://localhost:${PORT}/api/inventory/raw-material`);
  console.log(`   📦 Finished Goods: GET http://localhost:${PORT}/api/inventory/finished-goods`);
  console.log(`\n🏢 Company: Pakistan Wire Industries Ltd.`);
});