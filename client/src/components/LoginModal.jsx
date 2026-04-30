import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, X } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#2a2a2a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-black dark:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Please log in to access question papers and exam resources.</p>
            </div>

            <div className="space-y-4">
              <Link
                to="/login"
                className="flex items-center justify-center w-full py-4 px-6 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In Now
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center w-full py-4 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-2xl font-bold transition-all"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Free Account
              </Link>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
             Made for students of Dcrust
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
