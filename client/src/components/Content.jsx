import React, { useEffect, useState, useRef } from "react";
import { Filter, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import Navbar from "./Navbar";
import CourseCard from "./CourseCard";
import { courseService } from "../services/courseService";
import { authService } from "../services/authService";
import { recommendationService } from "../services/recommendationService";

const Content = () => {
  const [courses, setCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getAllCourses();
        setCourses(response.courses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch recommended courses - updated to use the service
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      // Only fetch recommendations if user is logged in
      if (!authService.isLoggedIn()) {
        return;
      }

      try {
        setRecommendationsLoading(true);
        const recommendations = await recommendationService.getRecommendations();
        
        // Combine all types of recommendations and take the top 5
        const allRecommendations = [
          ...(recommendations.collaborative || []),
          ...(recommendations.learning_path || []), 
          ...(recommendations.content_based || []),
          ...(recommendations.featured || [])
        ];
        
        // Remove duplicates (based on course ID)
        const uniqueRecommendations = allRecommendations.filter((course, index, self) =>
          index === self.findIndex((c) => c.id === course.id)
        );
        
        // Take the top 5 recommendations
        setRecommendedCourses(uniqueRecommendations.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        // If recommendations fail, we'll just use the regular featured courses
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, []);

  const categories = [
    "All",
    "Programming",
    "Web Development",
    "Mobile Development",
    "Game Development",
    "Cybersecurity",
    "Design",
    "Cloud Computing",
    "Data Science",
    "Blockchain",
    "AI & ML",
    "DevOps",
    "Marketing",
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const slidePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const slideNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  // Determine which courses to display in the top section
  const displayedTopCourses = recommendedCourses.length > 0
    ? recommendedCourses
    : courses.slice(0, 5);

  const isShowingRecommendations = recommendedCourses.length > 0 && authService.isLoggedIn();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-4">{error}</h2>
          <button
            className="bg-blue-600 px-4 py-2 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pb-28 px-4 pt-10">
      {/* featured courses */}
      <section className="max-w-7xl mx-auto mb-20">
        <div
          className={`inline-flex items-center px-4 py-1 mb-6 rounded-2xl text-sm font-medium shadow-sm gap-2 ${
            isShowingRecommendations
              ? "border border-blue-600 bg-blue-700/40 text-blue-200"
              : "border border-green-600 bg-green-700 text-green-200"
          }`}
        >
          {isShowingRecommendations ? (
            <>
              <Sparkles size={16} className="text-blue-200" />
              Recommended For You
            </>
          ) : (
            <>🚀 Featured Courses</>
          )}
        </div>

        {recommendationsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          // Custom three-column layout for swiper
          <div className="flex items-center gap-2">
            {/* Left arrow container */}
            <div className="flex-shrink-0 w-12 flex items-center justify-center">
              <button 
                onClick={slidePrev} 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white border border-gray-700 hover:bg-blue-700 transition-colors focus:outline-none"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            
            {/* Swiper container (middle section) */}
            <div className="flex-grow overflow-hidden">
              <Swiper
                ref={swiperRef}
                modules={[Navigation]}
                spaceBetween={24}
                breakpoints={{
                  640: { slidesPerView: 1.2 },
                  768: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
                className="py-4"
              >
                {displayedTopCourses.map((course, index) => (
                  <SwiperSlide key={course._id || course.id}>
                    <CourseCard course={course} index={index} />
                    {isShowingRecommendations && course.recommendation_type && (
                      <div className="mt-2">
                        <span className={`
                          text-xs px-2 py-1 rounded-full
                          ${course.recommendation_type === 'collaborative' ? 'bg-purple-900/50 text-purple-300 border border-purple-500' : ''}
                          ${course.recommendation_type === 'learning_path' ? 'bg-green-900/50 text-green-300 border border-green-500' : ''}
                          ${course.recommendation_type === 'content_based' ? 'bg-blue-900/50 text-blue-300 border border-blue-500' : ''}
                          ${course.recommendation_type === 'featured' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500' : ''}
                        `}>
                          {course.recommendation_type === 'collaborative' && 'Based on similar users'}
                          {course.recommendation_type === 'learning_path' && 'Next in your journey'}
                          {course.recommendation_type === 'content_based' && 'Similar content'}
                          {course.recommendation_type === 'featured' && 'Popular course'}
                        </span>
                      </div>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            {/* Right arrow container */}
            <div className="flex-shrink-0 w-12 flex items-center justify-center">
              <button 
                onClick={slideNext} 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white border border-gray-700 hover:bg-blue-700 transition-colors focus:outline-none"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* filter + search */}
      <section className="max-w-7xl mx-auto mb-10 flex flex-wrap items-center gap-4 justify-between px-2">
        <div className="flex justify-between items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            aria-label="Category Selector"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-300 shadow-sm"
          >
            {categories.map((cat, idx) => (
              <option
                key={idx}
                style={{ backgroundColor: "#1f2937", color: "#d1d5db" }}
                value={cat}
              >
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 4a6 6 0 0 1 0 12 6 6 0 0 1 0-12Zm0 0a6 6 0 0 0 0 12m4.5 2.5l4.5 4.5"
              ></path>
            </svg>
          </div>
        </div>
      </section>

      {/* all courses */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <CourseCard key={course._id} course={course} index={index} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-400 mt-10">
            No courses found. 🧐
          </div>
        )}
      </section>

      {/* navbar */}
      <Navbar />
    </div>
  );
};

export default Content;