import { Clock, Globe, Users } from "lucide-react";

const CourseCard = ({course, index}) => (
  <div
    key={index}
    className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 overflow-hidden shadow-lg transition-all duration-200"
  >
    <img
      src={course.placeholderImage}
      alt={course.title}
      className="w-full h-32 object-cover rounded-t-lg"
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
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
      <button className="mt-4 w-full py-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition font-medium text-sm shadow-md">
        Enroll Now
      </button>
    </div>
  </div>
);

export default CourseCard;
