// client/src/services/courseService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/courses";

export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course by title
  getCourseByTitle: async (title) => {
    try {
      const response = await axios.get(
        `${API_URL}/${encodeURIComponent(title)}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Add this if missing
getCourseById: async (id) => {
  try {
    if (!id) throw new Error("Course ID is required");
    console.log("Getting course by ID:", id);
    const response = await axios.get(`${API_URL}/id/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
},
};
