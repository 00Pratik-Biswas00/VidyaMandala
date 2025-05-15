import axios from "axios";

const ML_API_URL = import.meta.env.VITE_ML_API_URL;

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: ML_API_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authorization header for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`ML API Success [${response.config.url}]:`, response.status);
    return response;
  },
  (error) => {
    console.error(
      `ML API Error [${error.config?.url || "unknown"}]:`,
      error.message
    );
    return Promise.reject(error);
  }
);

export const mlService = {
  // Update the endpoints to match the FastAPI routes
generateLearningPlan: async (courseId, months, hours, score) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required for plan generation');
    }
    
    // Ensure all parameters are valid
    const validMonths = Math.max(1, parseInt(months) || 1);
    const validHours = Math.max(1, parseInt(hours) || 1);
    const validScore = Math.max(0, Math.min(5, parseInt(score) || 0));
    
    console.log(`Generating plan for course: ${courseId}, months: ${validMonths}, hours: ${validHours}, score: ${validScore}`);
    
    const response = await api.post('/learning/generate-plan', {
      courseId: courseId,
      months: validMonths,
      hours: validHours,
      score: validScore
    });
    
    console.log("Plan generation response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("Failed to generate learning plan:", error);
    throw error;
  }
},

  // Also fix the quiz endpoint
  getCourseQuiz: async (courseId) => {
    try {
      if (!courseId) {
        throw new Error("Course ID is required for quiz fetching");
      }

      console.log(`Fetching quiz for course: ${courseId}`);
      // CHANGED: Fixed the path to match the FastAPI router prefix
      const response = await api.get(`/learning/quiz/${courseId}`);

      if (!response.data || !response.data.questions) {
        console.warn("Invalid response format from quiz API:", response.data);
        return [];
      }

      return response.data.questions;
    } catch (error) {
      console.error("Failed to fetch quiz questions:", error);
      throw error;
    }
  },
};

export default mlService;
