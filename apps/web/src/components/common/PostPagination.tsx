'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PostPaginationProps } from '@moimi/core/types/postPagination';

export default function PostPagination({
  page,
  totalPages,
  windowSize,
  onPageChange,
}: PostPaginationProps) {
  if (totalPages <= 0) return null;

  const currentPage = Math.min(page, totalPages);
  const blockStart =
    Math.floor((currentPage - 1) / windowSize) * windowSize + 1;
  const blockEnd = Math.min(blockStart + windowSize - 1, totalPages);
  const visiblePages = Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, index) => blockStart + index
  );

  return (
    <nav
      aria-label="게시물 페이지"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        aria-label="이전 페이지 묶음"
        onClick={() => onPageChange(Math.max(1, blockStart - windowSize))}
        disabled={blockStart === 1}
        className="flex items-center justify-center text-[#2C2C2C]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
      >
        <ChevronLeft size={22} strokeWidth={2.5} />
      </button>

      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          aria-current={currentPage === pageNumber ? 'page' : undefined}
          onClick={() => onPageChange(pageNumber)}
          className={`flex items-center justify-center px-1 text-base font-semibold transition-all duration-150 active:scale-90 ${
            currentPage === pageNumber
              ? 'text-[#5E92F0]'
              : 'cursor-pointer text-[#2C2C2C]/50'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        aria-label="다음 페이지 묶음"
        onClick={() =>
          onPageChange(Math.min(totalPages, blockStart + windowSize))
        }
        disabled={blockEnd === totalPages}
        className="flex items-center justify-center text-[#2C2C2C]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
      >
        <ChevronRight size={22} strokeWidth={2.5} />
      </button>
    </nav>
  );
}
