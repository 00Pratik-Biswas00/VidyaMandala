import { Home, BookOpen, Search, User, Youtube, AlertCircle, Book } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "My Courses", icon: BookOpen, path: "/courses" },
    { label: "Youtube Links", icon: Youtube, path: "/ytlinks" },
    { label: "Pdf Summary", icon: BookOpen, path: "/pdfsummary" },
    { label: "Article", icon: Book, path: "/article" },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 backdrop-blur-md shadow-lg rounded-2xl px-6 py-2 flex justify-between items-center w-[90%] max-w-sm border border-gray-700 z-50">
      {navItems.map((item, idx) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={idx}
            to={item.path}
            className={`group flex flex-col items-center justify-center transition-all duration-200 ${
              isActive ? "text-blue-400" : "text-gray-300 hover:text-blue-400"
            }`}
          >
            <div
              className={`p-2 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md scale-105"
                  : "hover:bg-blue-100 hover:scale-105 active:scale-95"
              }`}
            >
              <Icon size={20} className="group-hover:animate-bounce-slow" />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
