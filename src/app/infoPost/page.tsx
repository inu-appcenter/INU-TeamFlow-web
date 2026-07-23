'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getInfoPosts } from '@/api/infoPost';
import {
  infoPostCategoryColorMap,
  infoPostCategoryFilterOptions,
  infoPostCategoryMap,
} from '@/constants/infoPost';
import { infoPostKeys, useInfoPosts } from '@/hooks/useInfoPostQuery';
import type { GetInfoPostsParams, InfoPostCategory } from '@/types/infoPost';
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Plus,
  Search,
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export default function InfoPost() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | InfoPostCategory
  >('ALL');
  const [page, setPage] = useState(1);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryScroll = (direction: 'left' | 'right') => {
    const container = categoryScrollRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    });
  };
  const queryParams: GetInfoPostsParams = {
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    keyword: searchKeyword || undefined,
    page: page - 1,
    size: ITEMS_PER_PAGE,
    sort: ['createdAt,DESC'],
  };

  const { data: infoPostData, isLoading } = useInfoPosts(queryParams);

  const infoPosts = infoPostData?.content ?? [];
  const totalPages = infoPostData?.totalPages ?? 0;

  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

  const handleCategoryChange = (category: 'ALL' | InfoPostCategory) => {
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
      page,
    };

    void queryClient.prefetchQuery({
      queryKey: infoPostKeys.list(nextPageParams),
      queryFn: () => getInfoPosts(nextPageParams),
      staleTime: 30 * 1000,
    });
  }, [infoPostData, page, queryClient, selectedCategory, searchKeyword]);

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
        {/* 헤더 */}
        <header className="mt-12 mb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            <h1 className="text-2xl font-bold text-[#2C2C2C]">정보</h1>
          </div>
        </header>

        {/* 필터 */}
        <section className="mb-4 flex flex-col gap-3">
          {/* 카테고리 */}
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => handleCategoryScroll('left')}
              aria-label="이전 카테고리 보기"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5] bg-white text-[#2C2C2C]/60 transition-all duration-150 hover:bg-[#F6F8FA] active:scale-90 sm:hidden"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div
              ref={categoryScrollRef}
              className="scrollbar-hide min-w-0 flex-1 overflow-x-auto scroll-smooth"
            >
              <div className="flex w-max gap-2 px-0.5">
                {infoPostCategoryFilterOptions.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      handleCategoryChange(
                        category.value as 'ALL' | InfoPostCategory
                      )
                    }
                    className={`shrink-0 cursor-pointer rounded-2xl border-[0.5px] px-3.5 py-1.5 text-sm font-normal whitespace-nowrap transition-all duration-150 active:scale-95 ${
                      selectedCategory === category.value
                        ? 'border-[#5E92F0] bg-[#5E92F0] text-white'
                        : 'border-[#D6DDE5] bg-white text-[#2C2C2C] hover:bg-[#F6F8FA]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCategoryScroll('right')}
              aria-label="다음 카테고리 보기"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5] bg-white text-[#2C2C2C]/60 transition-all duration-150 hover:bg-[#F6F8FA] active:scale-90 sm:hidden"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* 검색창 + 작성 버튼 */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="flex h-10 min-w-0 items-center gap-3 rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-3">
              <Search size={18} className="shrink-0 text-[#989898]" />

              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="검색어를 입력하세요"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#2C2C2C] outline-none placeholder:text-[#989898]"
              />
            </div>

            <button
              type="button"
              onClick={() => router.push('/infoPost/create')}
              className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#5E92F0] px-3 text-sm font-medium whitespace-nowrap text-white transition-all duration-150 hover:bg-[#4F84E5] active:scale-95 sm:px-4 sm:text-base"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>정보글 작성</span>
            </button>
          </div>
        </section>

        {/* 리스트 */}
        <section className="flex flex-col gap-3">
          {isLoading && (
            <div className="flex h-[250px] items-center justify-center text-sm text-[#989898]">
              정보글을 불러오는 중입니다
            </div>
          )}

          {!isLoading &&
            infoPosts.map((infoPost) => (
              <Link
                key={infoPost.infoPostId}
                href={`/infoPost/${infoPost.infoPostId}`}
              >
                <div className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-4 py-4 transition-all duration-150 hover:bg-[#FAFAFA] active:scale-[0.995]">
                  <div className="flex items-center gap-4">
                    {/* 고정 썸네일 영역 */}
                    <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] sm:w-24">
                      {infoPost.thumbnailUrl ? (
                        <Image
                          src={infoPost.thumbnailUrl}
                          alt={`${infoPost.title} 썸네일`}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#B8C0CA]">
                          <ImageIcon
                            size={24}
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>

                    {/* 글 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          style={{
                            backgroundColor:
                              infoPostCategoryColorMap[infoPost.category],
                          }}
                          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-[#2C2C2C]/80"
                        >
                          {infoPostCategoryMap[infoPost.category]}
                        </span>

                        <h2 className="truncate text-base font-semibold text-[#2C2C2C] sm:text-lg">
                          {infoPost.title}
                        </h2>
                      </div>

                      <p className="mt-2 truncate px-1 text-xs text-[#989898]">
                        {infoPost.recruitmentCount > 0
                          ? `연결된 모집글 ${infoPost.recruitmentCount}개`
                          : '연결된 모집글이 없습니다'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          {!isLoading && infoPosts.length === 0 && (
            <div className="flex h-[60vh] items-center justify-center rounded-xl bg-white text-sm text-[#989898]">
              {searchKeyword || selectedCategory !== 'ALL'
                ? '검색 조건에 맞는 정보글이 없습니다'
                : '등록된 정보글이 없습니다'}
            </div>
          )}
        </section>

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center text-[#2C2C2C]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
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
              )
            )}

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
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
