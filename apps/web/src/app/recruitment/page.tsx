'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecruitments } from '@moimi/core/hooks/useRecruitmentQuery';
import { getDday } from '@/utils/date/getDday';
import { formatDate } from '@/utils/date/formatDate';
import { categoryFilterOptions } from '@moimi/core/constants/category';
import { useErrorToast } from '@/hooks/useErrorToast';
import Header from '@/components/common/Header';
import ContentCard from '@/components/common/ContentCard';

const pageName = '모집';
const isSearch = true;
const searchFilter = [
  { value: 'title', label: '제목' },
  { value: 'announcementTitle', label: '정보글' },
];
const isCreate = true;
const isCategory = true;

const PAGE_SIZE = 20;
const PAGE_WINDOW_SIZE = 5;

export default function Recruitment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(1); // 화면 표시는 1-based

  const { errorMessage, setErrorMessage } = useErrorToast(
    1800,
    searchParams.get('error') === 'school-verification-required'
      ? '학교 인증 후 이용 가능합니다'
      : ''
  );

  useEffect(() => {
    if (!errorMessage) return;

    router.replace('/recruitment');

    const timer = setTimeout(() => setErrorMessage(''), 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    setPage(1);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const normalizedKeyword = keyword.replace(/\s/g, '');

  // 백엔드는 0-based page, 화면 표시는 1-based라 -1 해서 넘김
  const { data: recruitmentData } = useRecruitments(page - 1, PAGE_SIZE);
  const recruitments = recruitmentData?.content ?? [];
  const totalPages = recruitmentData?.totalPages ?? 0;
  const currentPage = page;

  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: Math.max(blockEnd - blockStart + 1, 0) },
    (_, i) => blockStart + i
  );

  const filtered = recruitments.filter((recruitment) => {
    const title = recruitment.title.replace(/\s/g, '');
    const announcementTitle = (recruitment.announcementTitle ?? '').replace(
      /\s/g,
      ''
    );

    const matchesCategory =
      selectedCategory === 'ALL' || recruitment.category === selectedCategory;

    const matchesKeyword =
      searchType === 'title'
        ? title.includes(normalizedKeyword)
        : searchType === 'announcementTitle'
          ? announcementTitle.includes(normalizedKeyword)
          : true;

    return matchesCategory && matchesKeyword;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-100 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <div className="mx-auto mb-20 max-w-[1180px]">
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          searchFilter={searchFilter}
          categories={categoryFilterOptions}
          keyword={keyword}
          searchType={searchType}
          selectedCategory={selectedCategory}
          onKeywordChange={handleKeywordChange}
          onSearchTypeChange={handleSearchTypeChange}
          onCategoryChange={handleCategoryChange}
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((recruitment) => {
            const endDate = new Date(recruitment.endAt);
            endDate.setHours(0, 0, 0, 0);
            const isClosed = endDate < today || !recruitment.isOpened;

            return (
              <ContentCard
                key={recruitment.recruitmentId}
                cardType="recruitment"
                category={recruitment.category}
                title={recruitment.title}
                content={recruitment.announcementTitle ?? ''}
                cardStatus={isClosed ? 'CLOSED' : 'OPEN'}
                path={`/recruitment/${recruitment.recruitmentId}`}
                startAt={formatDate(recruitment.createdAt)}
                endAt={formatDate(recruitment.endAt)}
                dDay={getDday(recruitment.endAt)}
              />
            );
          })}
        </section>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 py-4">
            <button
              type="button"
              onClick={() =>
                setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
              }
              disabled={blockStart === 1}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            {visiblePages.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex items-center justify-center px-1 text-[15px] font-semibold transition-all duration-150 active:scale-90 ${
                  currentPage === n
                    ? 'text-[#5E92F0]'
                    : 'cursor-pointer text-[#2c2c2c]/50'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setPage(Math.min(totalPages, blockStart + PAGE_WINDOW_SIZE))
              }
              disabled={blockEnd === totalPages}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
