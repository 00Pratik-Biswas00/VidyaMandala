import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add authorization header for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API services
export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        console.warn('No token received in login response');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login service error:', error.response || error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error getting current user:", e);
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      return !!token && !!user;
    } catch (e) {
      console.error("Error checking authentication status:", e);
      return false;
    }
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    try {
      return localStorage.getItem('token') || '';
    } catch (e) {
      console.error("Error getting token:", e);
      return '';
    }
  },
};

export default authService;