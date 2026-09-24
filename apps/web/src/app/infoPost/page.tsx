'use client';

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePostListState, type PostListState } from '@/hooks/usePostListState';
import { infoPostCategoryFilterOptions } from '@moimi/core/constants/infoPost';
import { useInfoPosts } from '@moimi/core/hooks/useInfoPostQuery';
import type {
  GetInfoPostsParams,
  InfoPostCategory,
} from '@moimi/core/types/infoPost';
import Header from '@/components/common/Header';
import ContentCard from '@/components/common/ContentCard';
import { formatDate } from '@/utils/date/formatDate';

const pageName = '정보';
const searchFilter = [{ value: 'title', label: '제목' }];

const ITEMS_PER_PAGE = 20;
const PAGE_WINDOW_SIZE = 5;

const INITIAL_LIST_STATE: PostListState = {
  page: 1,
  keyword: '',
  queryKeyword: '',
  searchType: 'title',
  selectedCategory: 'ALL',
};

export default function InfoPost() {
  const [listState, setListState, isRestored] = usePostListState(
    'infoPost:list',
    INITIAL_LIST_STATE
  );

  const {
    page,
    keyword,
    queryKeyword: searchKeyword,
    searchType,
    selectedCategory,
  } = listState;

  const setPage = (nextPage: number) => {
    setListState((prev) => ({ ...prev, page: nextPage }));
  };

  const handleKeywordChange = (value: string) => {
    setListState((prev) => ({ ...prev, keyword: value, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setListState((prev) => ({
      ...prev,
      selectedCategory: category,
      page: 1,
    }));
  };

  const handleSearchTypeChange = (type: string) => {
    setListState((prev) => ({ ...prev, searchType: type, page: 1 }));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextKeyword = keyword.trim();

      setListState((prev) =>
        prev.queryKeyword === nextKeyword
          ? prev
          : { ...prev, queryKeyword: nextKeyword }
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword, setListState]);

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

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Header
          pageName={pageName}
          isSearch
          isCreate
          isCategory
          searchFilter={searchFilter}
          categories={infoPostCategoryFilterOptions}
          keyword={keyword}
          searchType={searchType}
          selectedCategory={selectedCategory}
          onKeywordChange={handleKeywordChange}
          onSearchTypeChange={handleSearchTypeChange}
          onCategoryChange={handleCategoryChange}
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isRestored &&
            !isLoading &&
            infoPosts.map((infoPost) => (
              <ContentCard
                key={infoPost.infoPostId}
                cardType="infoPost"
                category={infoPost.category}
                title={infoPost.title}
                path={`/infoPost/${infoPost.infoPostId}`}
                createdAt={formatDate(infoPost.createdAt)}
                thumbnailUrl={infoPost.thumbnailUrl}
              />
            ))}
        </section>

        {isRestored && !isLoading && totalPages > 0 && (
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
