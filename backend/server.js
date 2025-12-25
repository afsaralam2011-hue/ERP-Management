// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.json({
    message: "ERP System Backend API is running",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: "OK",
    service: "ERP System API",
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
      features: ["authentication", "database", "api"]
    }
  });
});

// ========== NEW AUTH APIs ==========
// Register API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Dummy response
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: Date.now(),
        firstName,
        lastName,
        email,
        role: 'user'
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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Dummy check
    if (email === 'admin@example.com' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'admin'
        },
        token: 'admin-jwt-token'
      });
    }

    // Default user
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        role: 'user'
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
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date()
      },
      {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
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
// ========== END NEW APIs ==========

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Home: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`👤 Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
});
// Add this before other routes
app.get('/manifest.json', (req, res) => {
  res.json({
    "name": "ERP System",
    "short_name": "ERP",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#ffffff"
  });
});