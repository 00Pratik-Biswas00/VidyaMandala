// services/recommendationService.js
import axios from "axios";
import { authService } from "./authService";
import { mlServiceUtils } from "./mlServiceUtils";

// Fix any whitespace issues in the API URL
const API_URL = (
  import.meta.env.VITE_ML_API_URL || "http://localhost:5000"
).trim();
console.log("ML API URL:", API_URL);

// Client-side fallback recommendation engine
const generateFallbackRecommendations = (courses, userId) => {
  if (!courses || !courses.length) return [];
  console.log("Using client-side fallback recommendation engine");

  // Create a scoring system for courses based on basic factors
  const scoredCourses = courses.map((course) => {
    // Base score - popularity is a factor
    let score = course.enrolled || 0;

    // Add some deterministic randomization based on user ID
    const seed = userId
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    score += (seed % 100) * (course.title.length % 10);

    return { course, score };
  });

  // Sort by score (highest first) and return the top recommendations
  return scoredCourses
    .sort((a, b) => b.score - a.score)
    .map((item) => item.course)
    .slice(0, 6); // Get top 6 recommendations
};

// Helper function to get auth headers
const getAuthHeader = () => {
  const token = authService.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const recommendationService = {
  // Get personalized course recommendations
  // Update getRecommendations function
  getRecommendations: async (courses = null, count = 6) => {
    try {
      // First check if user is logged in
      if (!authService.isLoggedIn()) {
        return [];
      }

      const user = authService.getCurrentUser();
      if (!user || !user.id) {
        return [];
      }

      // Check if ML service is available
      const isAvailable = await mlServiceUtils.checkHealth();
      if (!isAvailable) {
        console.log(
          "ML service unavailable, using client-side recommendations"
        );
        return courses ? generateFallbackRecommendations(courses, user.id) : [];
      }

      // Log the full URL to help with debugging
      const fullUrl = `${API_URL}/recommender/recommend`;
      console.log("Calling recommender API at:", fullUrl);

      try {
        // Then get recommendations
        const response = await axios.post(
          fullUrl,
          {
            userId: user.id,
            count,
          },
          getAuthHeader()
        );

        const recommendations = response.data.recommendations || [];
        console.log(
          `Received ${recommendations.length} recommendations from ML service`
        );

        // If ML service returns empty recommendations, use client-side
        if (!recommendations.length && courses) {
          console.log(
            "ML service returned empty recommendations, using fallback"
          );
          return generateFallbackRecommendations(courses, user.id);
        }

        return recommendations;
      } catch (apiError) {
        console.error("Error from ML service:", apiError);
        // Use fallback recommendations
        return courses ? generateFallbackRecommendations(courses, user.id) : [];
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  },
  // Track user activity (search, course view, enrollment)
  trackActivity: async (activityType, courseId = null, searchQuery = null) => {
    try {
      if (!authService.isLoggedIn()) {
        return; // Don't track if not logged in
      }

      const user = authService.getCurrentUser();
      if (!user || !user.id) {
        return; // Don't track if we can't get user ID
      }

      // Store locally first (as backup)
      const historyKey = `user_activity_${user.id}`;
      const storedActivities = JSON.parse(
        localStorage.getItem(historyKey) || "[]"
      );
      storedActivities.push({
        type: activityType,
        courseId,
        searchQuery,
        timestamp: Date.now(),
      });
      // Keep only last 50 activities
      if (storedActivities.length > 50)
        storedActivities.splice(0, storedActivities.length - 50);
      localStorage.setItem(historyKey, JSON.stringify(storedActivities));

      // Check if recommender endpoint is available before trying to track on server
      const isAvailable = await mlServiceUtils.checkHealth();
      if (!isAvailable) {
        console.log("ML service unavailable, activity tracked locally only");
        return;
      }

      console.log(`Tracking activity: ${activityType} for user ${user.id}`);

      try {
        await axios.post(
          `${API_URL}/recommender/track-activity`,
          {
            userId: user.id,
            activityType,
            courseId,
            searchQuery,
            timestamp: Date.now(),
          },
          getAuthHeader()
        );

        console.log(`Activity ${activityType} tracked successfully on server`);
      } catch (error) {
        console.log("Failed to track on server, but activity saved locally");
      }
    } catch (error) {
      console.error("Error tracking user activity:", error);
    }
  },

  // Initialize the recommender with course data
  initializeRecommender: async (courses = null) => {
    try {
      if (!authService.isLoggedIn()) {
        return { success: false, message: "User not authenticated" };
      }

      // Check if recommender endpoint is available
      const isAvailable = await mlServiceUtils.checkHealth();
      if (!isAvailable) {
        console.log(
          "ML service unavailable, skipping recommender initialization"
        );
        return { success: false, message: "ML service unavailable" };
      }

      console.log("Initializing recommender service...");

      try {
        const response = await axios.post(
          `${API_URL}/recommender/initialize`,
          {
            courses, // Pass courses if available
          },
          getAuthHeader()
        );

        console.log("Recommender initialized:", response.data);
        return response.data;
      } catch (error) {
        console.log("Failed to initialize recommender:", error.message);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Error initializing recommender:", error);
      return { success: false, error: error.message };
    }
  },

  getStatus: async () => {
    try {
      // Check if ML service is available
      const isAvailable = await mlServiceUtils.checkHealth();
      if (!isAvailable) {
        return { success: false, message: "ML service unavailable" };
      }

      try {
        const response = await axios.get(
          `${API_URL}/recommender/status`,
          getAuthHeader()
        );
        return response.data;
      } catch (error) {
        console.log("Failed to get recommender status:", error.message);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Error getting recommender status:", error);
      return { success: false, error: error.message };
    }
  },
};
