import React, { useState } from "react";
import { Users, Clock, Globe } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const placeholderImage = "https://placehold.co/600x400";

const Content = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const epamCourses = [
    {
      title: "React for Beginners",
      enrolled: 4200,
      duration: "6h 30m",
      language: "English",
    },
    {
      title: "JavaScript Mastery",
      enrolled: 3100,
      duration: "8h",
      language: "English",
    },
    {
      title: "Node.js Crash Course",
      enrolled: 2900,
      duration: "5h",
      language: "English",
    },
    {
      title: "SQL & Database Design",
      enrolled: 3300,
      duration: "6h 10m",
      language: "English",
    },
    {
      title: "Advanced React Patterns",
      enrolled: 2700,
      duration: "7h",
      language: "English",
    },
    {
      title: "TypeScript Essentials",
      enrolled: 2000,
      duration: "5h 45m",
      language: "English",
    },
    {
      title: "Docker Basics",
      enrolled: 1800,
      duration: "4h",
      language: "English",
    },
    {
      title: "Microservices with Node.js",
      enrolled: 2200,
      duration: "6h 50m",
      language: "English",
    },
  ];

  const awsCourses = [
    {
      title: "Python for Data Science",
      enrolled: 5500,
      duration: "10h 15m",
      language: "English",
    },
    {
      title: "CSS Flexbox & Grid",
      enrolled: 1800,
      duration: "3h 45m",
      language: "English",
    },
    {
      title: "Vue.js Basics",
      enrolled: 2200,
      duration: "4h 20m",
      language: "English",
    },
    {
      title: "Web Accessibility",
      enrolled: 1500,
      duration: "2h 50m",
      language: "English",
    },
    {
      title: "AWS Cloud Practitioner",
      enrolled: 3200,
      duration: "6h",
      language: "English",
    },
    {
      title: "S3 & EC2 Masterclass",
      enrolled: 2500,
      duration: "5h 30m",
      language: "English",
    },
    {
      title: "Lambda & API Gateway",
      enrolled: 2100,
      duration: "4h 45m",
      language: "English",
    },
    {
      title: "AWS DevOps Essentials",
      enrolled: 3100,
      duration: "7h 10m",
      language: "English",
    },
  ];

  const renderCourseCard = (course, index) => (
    <div
      key={index}
      className="bg-white rounded-2xl transition-all duration-300 border  border-gray-200  hover:border-blue-500 overflow-hidden"
    >
      <img
        src={placeholderImage}
        alt={course.title}
        className="w-full h-44 object-cover"
      />
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {course.title}
        </h3>
        <div className="flex items-center text-sm text-gray-500 gap-2 mb-1">
          <Users size={16} className="text-blue-500" />
          <span>{course.enrolled.toLocaleString()} enrolled</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-3">
          <div className="flex items-center gap-1">
            <Clock size={15} className="text-blue-500" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={15} className="text-blue-500" />
            <span>{course.language}</span>
          </div>
        </div>
        <button className="mt-5 w-full py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition font-medium text-sm shadow">
          Enroll Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b  pt-28 pb-20 px-4">
      {/* Search Box */}
      <div className="max-w-4xl mx-auto mb-16 sticky top-20 z-30  pt-5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a course..."
          className="w-full px-6 py-4 border border-gray-300 rounded-xl text-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-lg bg-gray-50"
        />
      </div>

      {/* EPAM Courses */}
      <div className="max-w-7xl mx-auto mb-20">
        <div className="inline-block px-4 py-1 mb-6 border border-green-600 bg-green-50 text-green-700 rounded-2xl text-sm font-medium shadow-sm">
           Self placed courses by EPAM
        </div>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1280: { slidesPerView: 4.2 },
          }}
        >
          {epamCourses
            .filter((course) =>
              course.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((course, index) => (
              <SwiperSlide key={index}>
                {renderCourseCard(course, index)}
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* AWS Courses */}
      <div className="max-w-7xl mx-auto">
      <div className="inline-block px-4 py-1 mb-6 border border-green-600 bg-green-50 text-green-700 rounded-2xl text-sm font-medium shadow-sm">
        Self placed courses by AWS
        </div>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1280: { slidesPerView: 4.2 },
          }}
        >
          {awsCourses
            .filter((course) =>
              course.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((course, index) => (
              <SwiperSlide key={index}>
                {renderCourseCard(course, index)}
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Content;