import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    // Show up to 5 pages at a time
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between pt-2 pb-1">
      <div className="flex-1 text-xs text-gray-500">
        {totalItems !== undefined && itemsPerPage !== undefined && (
          <p>
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>
            {' to '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
            {' of '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center justify-center p-1 rounded-md ${
            currentPage === 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="First page"
        >
          <FiChevronsLeft className="h-3 w-3" />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center justify-center p-1 rounded-md ${
            currentPage === 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Previous page"
        >
          <FiChevronLeft className="h-3 w-3" />
        </button>
        
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-md ${
              currentPage === page
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center justify-center p-1 rounded-md ${
            currentPage === totalPages 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Next page"
        >
          <FiChevronRight className="h-3 w-3" />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center justify-center p-1 rounded-md ${
            currentPage === totalPages 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Last page"
        >
          <FiChevronsRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
} 