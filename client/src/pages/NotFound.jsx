import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-6">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:-translate-y-1"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;