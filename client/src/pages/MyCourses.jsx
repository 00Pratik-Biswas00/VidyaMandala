import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import { authService } from "../services/authService";
import Header from "../components/Header.jsx";

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!authService.isLoggedIn()) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(`${API_URL}/enrollment/my-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEnrolledCourses(response.data.courses);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
        setError("Failed to load your courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen  bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen  bg-gradient-to-b from-slate-950 to-slate-900 pb-28 px-4 pt-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 px-10">My Courses</h1>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {!loading && enrolledCourses.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl text-gray-300 mb-6">
                You haven't enrolled in any courses yet
              </h2>
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-10">
              {enrolledCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
        <Navbar />
      </div>
    </div>
  );
};

export default MyCourses;
