import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  MoreVertical,
  Share2,
  ChevronLeft,
  ChevronRight,
  AirVent,
} from "lucide-react";
import { useParams } from "react-router-dom";
import AllCourses from "../assets/AllCourses";

const SingleCourse = () => {
  const { title } = useParams();
  const course = AllCourses.find((course) => course.title === title);

  const [topics, setTopics] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (course && course.topics) {
      // Initialize with completed = false
      const initialTopics = course.topics.map((topic) => ({
        ...topic,
        completed: false,
      }));
      setTopics(initialTopics);
    }
  }, [course]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleCompletion = (id) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === id ? { ...topic, completed: !topic.completed } : topic
      )
    );
  };

  const completedCount = topics.filter((t) => t.completed).length;

  if (!course) {
    return (
      <div className="text-white text-center mt-20 text-2xl">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-end bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-20">
        <button className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
          Daily Plan Generator
          <AirVent size={16} />
        </button>
      </header>

      <div className="flex flex-1 mb-0.5">
        {/* Sidebar */}
        <aside
          className={`transition-all duration-300 bg-gray-900 border-r border-gray-800 h-screen overflow-y-auto custom-scrollbar fixed top-16 left-0 z-10 ${
            sidebarOpen ? "w-64 p-4" : "w-16 p-2"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            {sidebarOpen && (
              <h2 className="text-lg font-bold text-white">Course Progress</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white focus:outline-none border-2 border-gray-600 hover:border-gray-400 rounded-lg p-1"
            >
              {sidebarOpen ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>

          {sidebarOpen && (
            <>
              <div className="w-full h-2 rounded-full bg-gray-800 mb-2 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${(completedCount / topics.length) * 100 || 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {completedCount} of {topics.length} completed
              </p>
            </>
          )}

          <nav className="space-y-1">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => scrollToSection(topic.id)}
                className={`w-full flex items-center ${
                  sidebarOpen ? "justify-between" : "justify-center"
                } p-2 rounded-md text-left text-sm group transition-colors ${
                  topic.completed
                    ? "bg-green-900 border border-green-500 text-green-200"
                    : "bg-gray-800 border border-gray-700 text-gray-200"
                } hover:bg-gray-700`}
              >
                {sidebarOpen ? (
                  <>
                    <div className="flex flex-col truncate text-left">
                      <span className="font-medium truncate group-hover:text-blue-400">
                        {topic.title}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {topic.duration}
                      </span>
                    </div>
                    <div className="ml-2">
                      {topic.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {topic.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all p-6 sm:p-12 space-y-10 bg-gray-950`}
          style={{ marginLeft: sidebarOpen ? "16rem" : "4rem" }}
        >
          {topics.map((topic) => (
            <section
              key={topic.id}
              id={topic.id}
              className="bg-gray-900 rounded-3xl border border-gray-800 shadow-xl hover:shadow-2xl transition-shadow p-6 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-800 p-3 rounded-xl">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                      {topic.title}
                      {topic.completed && (
                        <span className="text-xs text-green-400 border border-green-400 rounded-full px-3 py-0.5 ml-2 bg-green-950">
                          Passed
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" /> {topic.duration}
                    </p>
                  </div>
                </div>
                <MoreVertical className="text-gray-400 hover:text-gray-200 cursor-pointer" />
              </div>

              <div className="flex justify-between items-center mt-6 border-t border-gray-800 pt-4">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  {topic.completed && <CheckCircle className="w-4 h-4" />}{" "}
                  {topic.completed && "Passed"}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleCompletion(topic.id)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                      topic.completed
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {topic.completed ? "Done" : "Mark as Done"}
                  </button>
                  <span className="text-sm text-white">Grade: 100%</span>
                </div>
              </div>
            </section>
          ))}

          {/* Mock Quiz Section */}
          <section
            id="mock-quiz"
            className="bg-gray-900 rounded-3xl border border-gray-800 shadow-xl hover:shadow-2xl transition-shadow p-8 relative group flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gray-800 p-3 rounded-xl">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  Mock Quiz Test
                  <span className="text-xs text-blue-400 border border-blue-400 rounded-full px-3 py-0.5 ml-2 bg-blue-950">
                    Practice
                  </span>
                </h2>
                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" /> 30min
                </p>
              </div>
            </div>

            <div className="w-full flex justify-center my-8">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-400"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="72, 100"
                    d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-blue-400">
                  72%
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 border-t border-gray-800 pt-4 w-full">
              <button className="px-6 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 mt-2">
                Start Mock Quiz
              </button>
            </div>
          </section>

          {/* Mock Interview Section */}
          <section
            id="mock-interview"
            className="bg-gray-900 rounded-3xl border border-gray-800 shadow-xl hover:shadow-2xl transition-shadow p-8 relative group flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gray-800 p-3 rounded-xl">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  Mock Interview Practice
                  <span className="text-xs text-yellow-400 border border-yellow-400 rounded-full px-3 py-0.5 ml-2 bg-yellow-950">
                    Bonus
                  </span>
                </h2>
                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" /> 60min
                </p>
              </div>
            </div>

            <div className="w-full flex justify-center my-8">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-yellow-400"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="85, 100"
                    d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-yellow-400">
                  85%
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 border-t border-gray-800 pt-4 w-full">
              <button className="px-6 py-2 text-sm font-semibold rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-all duration-300 mt-2">
                Start Mock Interview
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Scrollbar styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 9999px;
          border: 2px solid #1f2937;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default SingleCourse;
