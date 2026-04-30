function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
      const pages = [];
      const maxPagesToShow = 5; // Reduced for mobile
  
      if (totalPages <= maxPagesToShow) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);
  
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
  
        // Add ellipsis after first page if needed
        if (startPage > 2) {
          pages.push('...');
        }
  
        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
  
        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
  
        // Always show last page
        pages.push(totalPages);
      }
  
      return pages;
    };
  
    const pageNumbers = getPageNumbers();
  
    return (
      <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap px-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
          }`}
        >
          <span className="hidden sm:inline">← Previous</span>
          <span className="sm:hidden">←</span>
        </button>
  
        {/* Page Numbers */}
        <div className="flex gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 sm:px-3 py-2 text-gray-500 text-sm sm:text-base"
                >
                  ...
                </span>
              );
            }
  
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] sm:min-w-[40px] px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                  currentPage === page
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
  
        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
          }`}
        >
          <span className="hidden sm:inline">Next →</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>
    );
  }
  
  export default Pagination;