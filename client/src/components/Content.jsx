import React, { useEffect, useState, useRef } from "react";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Search,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import Navbar from "./Navbar";
import CourseCard from "./CourseCard";
import { courseService } from "../services/courseService";
import { recommendationService } from "../services/recommendationService";
import { authService } from "../services/authService";
import { mlServiceUtils } from "../services/mlServiceUtils";

const Content = () => {
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRecommended, setIsRecommended] = useState(false);
  const [mlServiceAvailable, setMlServiceAvailable] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchCoursesAndRecommendations = async () => {
      try {
        setLoading(true);

        // Get all courses
        const response = await courseService.getAllCourses();
        const allCourses = response.courses;
        setCourses(allCourses);

        // Calculate category counts for badges
        const counts = allCourses.reduce((acc, course) => {
          acc[course.category] = (acc[course.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryCounts(counts);

        // Check ML service availability first
        const isAvailable = await mlServiceUtils.checkHealth();
        setMlServiceAvailable(isAvailable);

        // Check if user is logged in
        const isLoggedIn = authService.isLoggedIn();
        const userData = authService.getCurrentUser();

        if (isLoggedIn && userData && userData.id && isAvailable) {
          try {
            // Get personalized recommendations
            const recommendations =
              await recommendationService.getRecommendations(allCourses);
            if (recommendations && recommendations.length > 0) {
              // Map recommendation IDs to full course objects
              const recommendedCourseObjects = recommendations
                .map((rec) => {
                  const matchingCourse = allCourses.find(
                    (course) => course._id === rec.id
                  );
                  return matchingCourse || null;
                })
                .filter(Boolean);

              if (recommendedCourseObjects.length > 0) {
                setFeaturedCourses(recommendedCourseObjects);
                setIsRecommended(true);
                console.log("Showing personalized recommendations");
                return; // Exit early since we set featured courses
              }
            }
          } catch (recError) {
            console.error("Failed to get recommendations:", recError);
          }
        }

        // Fallback to random courses
        setFeaturedCourses(getRandomCourses(allCourses, 6));
        setIsRecommended(false);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndRecommendations();
  }, []);

  // Get random courses helper function
  const getRandomCourses = (courses, count) => {
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

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

  // Handle search with activity tracking
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Track search activity if it's meaningful
    if (query.length >= 3 && authService.isLoggedIn() && mlServiceAvailable) {
      recommendationService.trackActivity("search", null, query);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-blue-300 animate-pulse">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-red-900/30 max-w-md">
          <div className="text-red-500 text-4xl mb-4 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-white text-center">
            {error}
          </h2>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-600/30"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 pb-32 pt-4">
      {/* Page header */}
      <header className="max-w-7xl mx-auto px-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 mt-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Explore Courses
          </span>
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Discover top-rated courses to enhance your skills and advance your
          career in technology and beyond.
        </p>
      </header>

      {/* featured courses */}
      <section className="max-w-7xl mx-auto mb-20 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                isRecommended
                  ? "bg-gradient-to-r from-amber-500/20 to-amber-700/20 border border-amber-500/30 text-amber-300"
                  : "bg-gradient-to-r from-emerald-500/20 to-emerald-700/20 border border-emerald-500/30 text-emerald-300"
              }`}
            >
              <span className="flex items-center gap-2">
                {isRecommended
                  ? "💡 Recommended For You"
                  : "🚀 Featured Courses"}
              </span>
            </div>
            {isRecommended && (
              <span className="text-xs text-slate-500">
                Based on your activity
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={slidePrev}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/70 hover:bg-slate-700 text-white border border-slate-700 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={slideNext}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/70 hover:bg-slate-700 text-white border border-slate-700 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Swiper container */}
        <div className="overflow-hidden">
          <Swiper
            ref={swiperRef}
            modules={[Navigation]}
            spaceBetween={20}
            breakpoints={{
              640: { slidesPerView: 1.2 },
              768: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4 },
            }}
            className="py-4 px-1"
          >
            {featuredCourses.map((course, index) => (
              <SwiperSlide key={course._id} className="h-full">
                <CourseCard course={course} index={index} featured={true} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Category chips + search */}
      <section className="max-w-7xl mx-auto mb-10 px-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-3 flex items-center gap-1.5">
                <Filter size={15} />
                <span>Categories</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5
                      ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white border border-blue-500"
                          : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600"
                      }`}
                  >
                    {cat}
                    {cat !== "All" && categoryCounts[cat] && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          selectedCategory === cat
                            ? "bg-blue-700 text-blue-100"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {categoryCounts[cat]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div className="w-full md:w-64 lg:w-80">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/80 text-slate-200 
                  border border-slate-700 focus:border-blue-500 focus:ring-2 
                  focus:ring-blue-500/20 focus:outline-none transition-all"
                />
                <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 4a6 6 0 0 1 0 12 6 6 0 0 1 0-12Zm0 0a6 6 0 0 0 0 12m4.5 2.5l4.5 4.5"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* all courses */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">All Courses</h2>
            <p className="text-slate-400 text-sm">
              {filteredCourses.length}{" "}
              {filteredCourses.length === 1 ? "course" : "courses"} available
            </p>
          </div>

          {selectedCategory !== "All" && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <CourseCard key={course._id} course={course} index={index} />
            ))
          ) : (
            <div className="col-span-full bg-slate-800/50 border border-slate-700 rounded-xl p-10 text-center">
              <div className="flex justify-center mb-4">
                <BookOpen className="h-16 w-16 text-slate-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                No courses found
              </h3>
              <p className="text-slate-400">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* navbar */}
      <Navbar />
    </div>
  );
};

export default Content;
