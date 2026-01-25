// frontend/src/api/config.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_URLS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`
  },
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  PRODUCTION: `${API_BASE_URL}/production`,
  DASHBOARD: `${API_BASE_URL}/dashboard`
};

// frontend/src/api/api.js
export const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Network error' };
  }
};