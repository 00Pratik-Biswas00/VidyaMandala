import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { authService } from "../services/authService";
import logo from "../assets/logo.png";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        setUser(authService.getUser());
      }
    };

    checkAuthStatus();

    const handleStorageChange = (event) => {
      if (event.key === "token") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#profile-menu")) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
      setMenuOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getRandomColor = (seed) => {
    const colors = [
      "#f87171",
      "#60a5fa",
      "#34d399",
      "#fbbf24",
      "#a78bfa",
      "#f472b6",
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  return (
    <nav className="w-full bg-gray-950 border-b border-gray-800 py-1 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Vidyamandala logo" className="w-16 h-16" />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-md text-blue-400 hover:text-white border border-blue-400 hover:bg-blue-600 transition font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              user && (
                <div id="profile-menu" className="relative">
                  <button
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 bg-gray-800 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors duration-200 shadow-sm"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getRandomColor(user.name) }}
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 overflow-hidden bg-gray-800 ">
                      <div className="px-4 py-2 text-gray-300 text-sm border-b border-gray-300">
                        {user.name}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-600 transition duration-150 hover:text-white"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-gray-800">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-2 rounded-md text-blue-400 hover:text-white bg-gray-700 hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user && (
                <span className="block px-6 py-2 text-gray-300">
                  Welcome, {user.name}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-200 font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
