import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import PaperCard from '../components/PaperCard';
import Pagination from '../components/Pagination';
import { getPapers } from '../services/papers.api';

function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Separate state for each filter
  const [searchQuery, setSearchQuery] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [session, setSession] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 50
  });

  // Load papers whenever any filter or page changes
  useEffect(() => {
    const loadPapers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: currentPage,
          limit: 50
        };

        // Only add non-empty params
        if (searchQuery) params.search = searchQuery;
        if (branch) params.branch = branch;
        if (semester) params.semester = semester;
        if (year) params.year = year;
        if (session) params.session = session;

        console.log('🔍 Fetching page:', currentPage, 'with params:', params);

        const response = await getPapers(params);
        setPapers(response.data);
        setPagination({
          total: response.pagination.total,
          pages: response.pagination.pages,
          limit: response.pagination.limit
        });
        
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setError('Failed to load papers. Please try again.');
        console.error('❌ Error loading papers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPapers();
  }, [currentPage, searchQuery, branch, semester, year, session]);

  const handlePageChange = (newPage) => {
    console.log('📄 Changing to page:', newPage);
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilters) => {
    console.log('🔧 Filters changed:', newFilters);
    setBranch(newFilters.branch);
    setSemester(newFilters.semester);
    setYear(newFilters.year);
    setSession(newFilters.session);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleSearch = (query) => {
    console.log('🔎 Search query:', query);
    setSearchQuery(query);
    setCurrentPage(1); // Reset to page 1 on search
  };

  // Create filters object for FilterBar
  const filters = {
    branch,
    semester,
    year,
    session
  };

  return (
    <div className="flex-1 py-6 sm:py-8 lg:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Question Papers
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Search and filter from {pagination.total} available papers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-5 sm:mb-6 lg:mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-sm mb-5 sm:mb-6 lg:mb-8 border border-gray-100">
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-base sm:text-lg text-gray-600">Loading papers...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-16 sm:py-20">
            <p className="text-base sm:text-lg text-red-500">{error}</p>
          </div>
        ) : papers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 sm:py-20">
            <div className="text-5xl sm:text-6xl mb-4">📭</div>
            <p className="text-lg sm:text-xl text-gray-600 mb-2">No papers found matching your criteria.</p>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          /* Papers Grid */
          <>
            {/* Results Counter */}
            <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm sm:text-base text-gray-600 font-medium">
                Showing {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} papers
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                Page {currentPage} of {pagination.pages}
              </span>
            </div>
            
            {/* Papers Grid - Mobile First: 2 columns, Tablet: 2-3 columns, Desktop: 3-4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
              {papers.map((paper) => (
                <PaperCard key={paper._id} paper={paper} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Papers;