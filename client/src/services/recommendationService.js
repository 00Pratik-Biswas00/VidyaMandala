import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/recommendations';

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

export const recommendationService = {
  // Get course recommendations for the current user
  getRecommendations: async (recentCourseId = null) => {
    try {
      const params = recentCourseId ? { recentCourseId } : {};
      const response = await api.get('/', { params });
      return response.data.recommendations;
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      throw error;
    }
  }
};

export default recommendationService;