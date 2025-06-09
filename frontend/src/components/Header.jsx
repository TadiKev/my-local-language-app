// src/components/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (langCode) => {
    localStorage.setItem('preferredLanguage', langCode);
    window.location.reload();
  };

  return (
    <header className="relative">
      {/* Gradient animation styles */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
      `}</style>

      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 animate-gradient shadow-md">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white hover:text-purple-200">
            LocalLang
          </Link>

          {/* Desktop nav + language + login/logout */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link to="/lessons" className="text-white hover:text-purple-200">
                Lessons
              </Link>
              <Link to="/dashboard" className="text-white hover:text-purple-200">
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link to="/upload-lesson" className="text-white hover:text-purple-200">
                  Upload Lesson
                </Link>
              )}
              <Link to="/profile" className="text-white hover:text-purple-200">
                Profile
              </Link>
            </nav>

            {/* Language Picker */}
            <LanguageSwitcher onSelect={handleLanguageChange} />

            {/* Login / Logout */}
            {user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger button (always visible on <md) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md hover:bg-purple-500 transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 animate-gradient border-t border-purple-700">
          <nav className="flex flex-col space-y-1 px-4 py-2">
            <Link
              to="/lessons"
              onClick={() => setMobileOpen(false)}
              className="block text-white hover:text-purple-200 py-2"
            >
              Lessons
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block text-white hover:text-purple-200 py-2"
            >
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/upload-lesson"
                onClick={() => setMobileOpen(false)}
                className="block text-white hover:text-purple-200 py-2"
              >
                Upload Lesson
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="block text-white hover:text-purple-200 py-2"
            >
              Profile
            </Link>

            {/* Language Picker (in mobile menu) */}
            <div className="py-2 border-t border-purple-700">
              <LanguageSwitcher onSelect={(code) => { setMobileOpen(false); handleLanguageChange(code); }} />
            </div>

            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left text-red-400 hover:text-red-600 py-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-white hover:text-purple-200 py-2"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
