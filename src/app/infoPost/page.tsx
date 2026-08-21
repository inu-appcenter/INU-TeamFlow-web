'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getInfoPosts } from '@/api/infoPost';
import { infoPostCategoryFilterOptions } from '@/constants/infoPost';
import { infoPostKeys, useInfoPosts } from '@/hooks/useInfoPostQuery';
import type { GetInfoPostsParams, InfoPostCategory } from '@/types/infoPost';
import Header from '@/components/common/Header';
import ContentCard from '@/components/common/ContentCard';
import { formatDate } from '@/utils/date/formatDate';
const pageName = '정보';

const isSearch = true;
const searchFilter = [{ value: 'title', label: '제목' }];

const isCreate = true;
const isCategory = true;

const ITEMS_PER_PAGE = 20;
const PAGE_WINDOW_SIZE = 5;

export default function InfoPost() {
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);

  const queryParams: GetInfoPostsParams = {
    keyword: searchKeyword || undefined,
    category:
      selectedCategory === 'ALL'
        ? undefined
        : (selectedCategory as InfoPostCategory),
    page: page - 1,
    size: ITEMS_PER_PAGE,
    sort: ['createdAt,DESC'],
  };

  const { data: infoPostData, isLoading } = useInfoPosts(queryParams);

  const infoPosts = infoPostData?.content ?? [];
  const totalPages = infoPostData?.totalPages ?? 0;
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: Math.max(blockEnd - blockStart + 1, 0) },
    (_, i) => blockStart + i
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };
  useEffect(() => {
    if (!infoPostData) {
      return;
    }

    const hasNextPage = page < infoPostData.totalPages;

    if (!hasNextPage) {
      return;
    }

    const nextPageParams: GetInfoPostsParams = {
      ...queryParams,
      keyword: searchKeyword || undefined,
      page,
      size: ITEMS_PER_PAGE,
      sort: ['createdAt,DESC'],
    };

    void queryClient.prefetchQuery({
      queryKey: infoPostKeys.list(nextPageParams),
      queryFn: () => getInfoPosts(nextPageParams),
      staleTime: 30 * 1000,
    });
  }, [infoPostData, page, queryClient, searchKeyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchKeyword(keyword.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          searchFilter={searchFilter}
          categories={infoPostCategoryFilterOptions}
          keyword={keyword}
          searchType={searchType}
          selectedCategory={selectedCategory}
          onKeywordChange={setKeyword}
          onSearchTypeChange={setSearchType}
          onCategoryChange={handleCategoryChange}
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {!isLoading &&
            infoPosts.map((infoPost) => (
              <ContentCard
                key={infoPost.infoPostId}
                cardType="infoPost"
                category={infoPost.category}
                title={infoPost.title}
                path={`/infoPost/${infoPost.infoPostId}`}
                createdAt={formatDate(infoPost.createdAt)}
                content=""
                cardStatus="WAITING"
              />
            ))}
        </section>

        {!isLoading && totalPages > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
              }
              disabled={blockStart === 1}
              className="flex items-center justify-center text-[#2C2C2C]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
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
              onClick={() =>
                setPage(Math.min(totalPages, blockStart + PAGE_WINDOW_SIZE))
              }
              disabled={blockEnd === totalPages}
              className="flex items-center justify-center text-[#2C2C2C]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
