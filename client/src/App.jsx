import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import GraphyFooterCTA from './components/Footer';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'sonner';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import { useContext } from 'react';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Papers = lazy(() => import('./pages/Papers'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1f1f] transition-colors duration-300">
      <Toaster position="top-right" richColors />
      <Navbar />
      <div className="pt-24 flex-grow flex flex-col">
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/papers" 
              element={
                <ProtectedRoute>
                  <Papers />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <AIAssistant />
      <GraphyFooterCTA />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;