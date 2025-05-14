import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Navbar from "./Navbar"; 
import CourseCard from "./CourseCard";
import { courseService } from "../services/courseService";

const Content = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
        <div className="inline-block px-4 py-1 mb-6 border border-green-600 bg-green-700 text-green-200 rounded-2xl text-sm font-medium shadow-sm">
          🚀 Featured Courses
        </div>
        <Swiper
          modules={[Navigation]}
          navigation
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1280: { slidesPerView: 4.2 },
          }}
        >
          {courses.slice(0, 5).map((course, index) => (
            <SwiperSlide key={course._id}>
              <CourseCard course={course} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* filter + search */}
      <section className="max-w-7xl mx-auto mb-10 flex flex-wrap items-center gap-4 justify-between px-2">
        <div className="flex justify-between items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-300 shadow-sm"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
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
          filteredCourses.map((course, index) =>
            <CourseCard course={course} index={index}  />
          )
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
