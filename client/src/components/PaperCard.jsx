function PaperCard({ paper }) {
  const handleClick = () => {
    window.open(paper.pdf_url, "_blank");
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1"
    >
     
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {paper.subject_name}
        </h3>

        <span className="inline-block mt-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs sm:text-sm font-semibold tracking-wide">
          {paper.subject_code}
        </span>
      </div>

     
      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
       
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
          {paper.branch}
        </span>

        
        {paper.semester && (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-xs sm:text-sm font-semibold">
            Sem {paper.semester}
          </span>
        )}

        
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
          {paper.session} {paper.year}
        </span>
      </div>

   
      <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
        <span className="text-primary-600 font-semibold text-xs sm:text-sm">
          View PDF
        </span>

      
        <span className="text-primary-600 text-sm transform transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </div>
  );
}

export default PaperCard;
