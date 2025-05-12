import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMenuOpen(false);
  };

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-extrabold text-blue-400 tracking-wide">
            Vm.
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-md text-blue-400 hover:text-blue-500 bg-gray-800 hover:bg-gray-700 transition-colors ease-in-out duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ease-in-out duration-200 font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors ease-in-out duration-200 font-medium"
              >
                Logout
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-400 hover:text-blue-400 transition-colors ease-in-out duration-200"
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
                className="block px-6 py-2 rounded-md text-blue-400 hover:text-blue-500 bg-gray-700 hover:bg-gray-600 transition-colors ease-in-out duration-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ease-in-out duration-200 font-medium"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors ease-in-out duration-200 font-medium"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
