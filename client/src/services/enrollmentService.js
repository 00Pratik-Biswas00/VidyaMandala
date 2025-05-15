import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/enrollment';

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

export const enrollmentService = {
  // Enroll in a course
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post('/enroll', { courseId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all enrolled courses
  getEnrolledCourses: async () => {
    try {
      const response = await api.get('/my-courses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId) => {
    try {
      const response = await api.delete(`/unenroll/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check enrollment status
  checkEnrollmentStatus: async (courseId) => {
    try {
      const response = await api.get(`/status/${courseId}`);
      return response.data.isEnrolled;
    } catch (error) {
      throw error;
    }
  }
};

export default enrollmentService;