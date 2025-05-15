import { useState, useEffect } from "react";
import { CheckCircle, Clock, Globe, Loader, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { enrollmentService } from "../services/enrollmentService";
import { authService } from "../services/authService";
import { recommendationService } from "../services/recommendationService"; // Add this
import { mlServiceUtils } from "../services/mlServiceUtils";

const fallbackImage = "https://placehold.co/600x400";
const handleImageError = (e) => {
  e.target.src = fallbackImage;
};

const CourseCard = ({ course, index }) => {
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (course && course._id && authService.isLoggedIn()) {
        try {
          setCheckingEnrollment(true);
          const enrolled = await enrollmentService.checkEnrollmentStatus(
            course._id
          );
          setIsEnrolled(enrolled);
        } catch (error) {
          console.error("Failed to check enrollment status:", error);
        } finally {
          setCheckingEnrollment(false);
        }
      } else {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollmentStatus();
  }, [course]);

  useEffect(() => {
    const trackCourseView = async () => {
      if (authService.isLoggedIn()) {
        try {
          // Store view locally regardless of ML service availability
          const userId = authService.getCurrentUser()?.id;
          if (userId) {
            const viewKey = `course_views_${userId}`;
            let views = JSON.parse(localStorage.getItem(viewKey) || '[]');
            if (!views.includes(course._id)) {
              views.push(course._id);
              localStorage.setItem(viewKey, JSON.stringify(views));
              console.log(`Locally tracked view for course: ${course.title}`);
            }
          }
          
          // Try to track on server if available
          recommendationService.trackActivity('view', course._id, null, course.category);
        } catch (error) {
          console.log("Error tracking course view:", error.message);
        }
      }
    };
  
    // Only track if course has valid ID and this is not checkingEnrollment state
    if (course && course._id && !checkingEnrollment) {
      trackCourseView();
    }
  }, [course?._id, checkingEnrollment]);
  
  const handleViewCourseClick = () => {
    // Track view locally and remotely if possible
    if (authService.isLoggedIn()) {
      console.log(`Tracking view click for course: ${course.title} (${course._id})`);
      recommendationService.trackActivity('view', course._id, null, course.category);
    }
    
    setLoading(true);
    setTimeout(() => {
      navigate(`/details/${course.title}`);
    }, 1000);
  };

  return (
    <div
      key={index}
      className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 overflow-hidden shadow-lg transition-all duration-200"
    >
      <img
        src={course.placeholderImage}
        alt={course.title}
        loading="lazy"
        onError={handleImageError}
        className="w-full h-32 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3
          className="text-lg font-semibold text-white mb-2 truncate"
          title={course.title}
        >
          {course.title}
        </h3>

        <div className="flex items-center text-sm text-gray-400 gap-2 mb-1">
          <Users size={16} className="text-blue-500" />
          <span>{course.enrolled.toLocaleString()} enrolled</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-3">
          <div className="flex items-center gap-1">
            <Clock size={15} className="text-blue-500" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={15} className="text-blue-500" />
            <span>{course.language}</span>
          </div>
        </div>

        <button
          onClick={handleViewCourseClick}
          disabled={loading || checkingEnrollment}
          className={`mt-3 w-full py-2 rounded-md text-white font-medium text-sm shadow-md transition ${
            loading || checkingEnrollment
              ? "bg-gray-600 cursor-wait"
              : isEnrolled
              ? "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
              : "bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          }`}
        >
          {loading || checkingEnrollment ? (
            <div className="flex justify-center items-center">
              <Loader size={16} className="animate-spin" />
            </div>
          ) : isEnrolled ? (
            "Continue Learning"
          ) : (
            "View Course"
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
