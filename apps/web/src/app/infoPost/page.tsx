'use client';

import { infoPostCategoryFilterOptions } from '@moimi/core/constants/infoPost';
import Header from '@/components/common/Header';
import ContentCard from '@/components/common/ContentCard';
import PostPagination from '@/components/common/PostPagination';
import { formatDate } from '@/utils/date/formatDate';
import { useInfoPostList } from '@/hooks/useInfoPostList';
import {
  INFO_POST_PAGE_WINDOW_SIZE,
  INFO_POST_SEARCH_FILTER,
} from '@/constants/infoPostList';

export default function InfoPost() {
  const {
    infoPosts,
    totalPages,
    isLoading,
    isRestored,
    page,
    keyword,
    searchType,
    selectedCategory,
    setPage,
    setKeyword,
    setSearchType,
    setCategory,
  } = useInfoPostList();

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Header
          pageName="정보"
          isSearch
          isCreate
          isCategory
          searchFilter={INFO_POST_SEARCH_FILTER}
          categories={infoPostCategoryFilterOptions}
          keyword={keyword}
          searchType={searchType}
          selectedCategory={selectedCategory}
          onKeywordChange={setKeyword}
          onSearchTypeChange={setSearchType}
          onCategoryChange={setCategory}
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

        {isRestored && !isLoading && (
          <PostPagination
            page={page}
            totalPages={totalPages}
            windowSize={INFO_POST_PAGE_WINDOW_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </main>
  );
}
