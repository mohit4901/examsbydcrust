import { useEffect, useState } from 'react';
import { getFilters } from '../services/papers.api';

function FilterBar({ filters, onFilterChange }) {
  const [availableFilters, setAvailableFilters] = useState({
    branches: [],
    semesters: [],
    years: [],
    sessions: []
  });

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const data = await getFilters();
      setAvailableFilters(data);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      branch: '',
      semester: '',
      year: '',
      session: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="flex flex-col gap-3">
      {/* Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <select
          value={filters.branch}
          onChange={(e) => handleChange('branch', e.target.value)}
          className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
        >
          <option value="">All Branches</option>
          {availableFilters.branches.map(branch => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>

      
        <select
          value={filters.year}
          onChange={(e) => handleChange('year', e.target.value)}
          className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
        >
          <option value="">All Years</option>
          {availableFilters.years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
  value={filters.semester}
  onChange={(e) => handleChange('semester', e.target.value)}
  className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
>
  <option value="">All Semesters</option>
  {availableFilters.semesters.map(sem => (
    <option key={sem} value={sem}>{sem}</option>
  ))}
</select>
        
        <select
          value={filters.session}
          onChange={(e) => handleChange('session', e.target.value)}
          className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
        >
          <option value="">All Sessions</option>
          {availableFilters.sessions.map(session => (
            <option key={session} value={session}>{session}</option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button 
          onClick={clearFilters} 
          className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
