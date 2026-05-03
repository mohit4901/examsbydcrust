import { Link, useLocation } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, LogIn, UserPlus, LogOut, Menu, X, User } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setOpen(false);

  return (
    <nav className="fixed top-0 left-0 z-[100] w-full flex justify-center bg-[#1f1f1f] border-b border-white/5">
      <div className="mx-3 flex w-full max-w-6xl items-center justify-between py-4">

        {/* Left: Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-black"
          >
            <path
              d="M12 2C7.58 2 4 5.58 4 10c0 3.53 2.29 6.53 5.47 7.59L9 22l3-3 3 3-.47-4.41C17.71 16.53 20 13.53 20 10c0-4.42-3.58-8-8-8z"
              fill="currentColor"
            />
          </svg>
        </Link>

        {/* Center title (hidden on small screens) */}
        <span className="hidden md:block text-white text-lg font-bold tracking-tight">
          Exams Of DCRUST
        </span>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-white text-base font-medium">
          <Link
            to="/"
            className={isActive("/") ? "text-white" : "text-gray-400 hover:text-white transition-colors"}
          >
            Home
          </Link>

          <Link
            to="/papers"
            className={isActive("/papers") ? "text-white" : "text-gray-400 hover:text-white transition-colors"}
          >
            Question Papers
          </Link>
          
          <div className="h-4 w-[1px] bg-white/10 mx-2" />

          {user ? (
            <div className="flex items-center gap-6">
              <Link 
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive("/profile") ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-bold">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button 
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className={isActive("/login") ? "text-white" : "text-gray-400 hover:text-white transition-colors"}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition-all text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-[#1f1f1f] border-b border-white/5 p-6 md:hidden shadow-2xl flex flex-col gap-4 z-[90]"
          >
            <Link
              to="/"
              onClick={closeMenu}
              className={`flex items-center gap-3 p-4 rounded-2xl ${
                isActive("/") ? "bg-white text-black font-bold" : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>

            <Link
              to="/papers"
              onClick={closeMenu}
              className={`flex items-center gap-3 p-4 rounded-2xl ${
                isActive("/papers") ? "bg-white text-black font-bold" : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Question Papers
            </Link>

            <div className="h-[1px] bg-white/5 my-2" />

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 p-4 rounded-2xl ${
                    isActive("/profile") ? "bg-white text-black font-bold" : "text-white hover:bg-white/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isActive("/profile") ? "bg-black text-white" : "bg-white/10 text-white"
                  }`}>
                    {user.name[0]}
                  </div>
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-xs text-gray-500">View Profile & Analysis</div>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); closeMenu(); }}
                  className="flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 text-white font-bold"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white text-black font-bold"
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
