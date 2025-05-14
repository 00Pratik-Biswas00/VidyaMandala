import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/progress';

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

export const progressService = {
  // Update topic completion status
  updateTopicStatus: async (courseId, topicId, completed, grade = null) => {
    try {
      console.log('Progress service - updateTopicStatus:', { 
        courseId, 
        topicId, 
        completed,
        grade 
      });
      
      const response = await api.post('/update-topic', { 
        courseId, 
        topicId, 
        completed,
        grade // Pass the grade to the backend
      });
      
      console.log('Progress service response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Progress service error:", error.response?.data || error.message);
      throw error;
    }
  },
  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      console.log('Progress service - getCourseProgress:', { courseId });
      const response = await api.get(`/${courseId}`);
      console.log('Get progress response:', response.data);
      return response.data.progress;
    } catch (error) {
      console.error("Failed to get course progress:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default progressService;