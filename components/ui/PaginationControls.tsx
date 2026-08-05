'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  itemName?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName = 'data',
}: PaginationControlsProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 border-t border-gray-100 mt-4" id="pagination-controls">
      {/* Informative Label */}
      <div className="text-sm text-gray-500" id="pagination-text">
        Menampilkan <span className="font-semibold text-gray-900">{startItem}</span> ke{' '}
        <span className="font-semibold text-gray-900">{endItem}</span> dari{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> {itemName}
      </div>

      {/* Pagination Action Controls */}
      <div className="flex items-center flex-wrap gap-3 justify-between sm:justify-end">
        {onPageSizeChange && (
          <div className="flex items-center gap-2" id="pagination-page-size">
            <span className="text-sm text-gray-500">Tampilkan</span>
            <select
              className="block pl-2 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2.5 py-2 rounded-l-xl border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all"
            id="pagination-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Numbers */}
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-3.5 py-2 border border-gray-200 bg-white text-sm font-medium text-gray-400 select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(Number(page))}
                aria-current={isActive ? 'page' : undefined}
                className={`relative inline-flex items-center px-3.5 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  isActive
                    ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="relative inline-flex items-center px-2.5 py-2 rounded-r-xl border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all"
            id="pagination-next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
