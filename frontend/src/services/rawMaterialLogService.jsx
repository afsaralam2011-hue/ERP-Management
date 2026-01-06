import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const rawMaterialLogService = {
  // Get all logs with filters
  getAll: (params) => api.get('/raw-material-log', { params }),
  
  // Get single log by ID
  getById: (id) => api.get(`/raw-material-log/${id}`),
  
  // Create new log
  create: (data) => api.post('/raw-material-log', data),
  
  // Update log
  update: (id, data) => api.put(`/raw-material-log/${id}`, data),
  
  // Delete log
  delete: (id) => api.delete(`/raw-material-log/${id}`),
  
  // Get overview statistics
  getStats: () => api.get('/raw-material-log/stats/overview'),
  
  // Get dashboard statistics
  getDashboardStats: () => api.get('/raw-material-log/stats/dashboard')
};

export default rawMaterialLogService;