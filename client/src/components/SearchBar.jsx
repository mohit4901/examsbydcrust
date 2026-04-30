import { useState, useEffect, useRef } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]); // Only depend on query, NOT onSearch

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search by subject name or code..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-5 py-3.5 pr-12 text-base border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
      />
      {query && (
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"
          onClick={() => setQuery('')}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;