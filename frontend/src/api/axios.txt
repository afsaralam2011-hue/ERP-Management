import axios from 'axios';

const instance = axios.create({
<<<<<<< HEAD
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
=======
  baseURL: process.env.REACT_APP_API_URL || 'https://erp-management-8rt3.onrender.com',
>>>>>>> de48dd99d82d0005078d2f34dac0bdbd9d3ade5d
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;