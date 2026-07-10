'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  categoryColorMap,
  categoryFilterOptions,
  categoryMap,
} from '@/constants/category';
import { useInfoPosts } from '@/hooks/useInfoPostQuery';
import type { InfoPostCategory } from '@/types/infoPost';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function InfoPost() {
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | InfoPostCategory
  >('ALL');
  const [page, setPage] = useState(1);

  const {
    data: infoPostData,
    isLoading,
    isFetching,
  } = useInfoPosts({
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    keyword: searchKeyword || undefined,
    page: page - 1,
    size: ITEMS_PER_PAGE,
    sort: ['createdAt,DESC'],
  });

  const infoPosts = infoPostData?.content ?? [];
  const totalPages = infoPostData?.totalPages ?? 0;

  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

  const handleCategoryChange = (category: 'ALL' | InfoPostCategory) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPage(1);
  };
  useEffect(() => {
    if (isComposing) return;

    const timer = window.setTimeout(() => {
      setSearchKeyword(keyword.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword, isComposing]);

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
        <section className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categoryFilterOptions.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() =>
                  handleCategoryChange(
                    category.value as 'ALL' | InfoPostCategory
                  )
                }
                className={`cursor-pointer rounded-2xl border-[0.5px] px-3.5 py-1.5 text-sm font-normal transition-all duration-150 active:scale-95 ${
                  selectedCategory === category.value
                    ? 'border-[#5E92F0] bg-[#5E92F0] text-white'
                    : 'border-[#D6DDE5] bg-white text-[#2C2C2C] hover:bg-[#F6F8FA]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 flex-1 items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white md:w-[400px] md:flex-none">
              <div className="relative h-full">
                <select
                  className="h-full appearance-none border-r-[0.5px] border-[#D6DDE5] bg-white px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
                  defaultValue="title"
                >
                  <option value="title">제목</option>
                </select>

                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#2C2C2C]">
                  <ChevronDown size={14} />
                </span>
              </div>

              <div className="flex flex-1 items-center gap-3 px-3">
                <Search size={18} className="shrink-0 text-[#989898]" />

                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={(event) => {
                    setIsComposing(false);
                    setKeyword(event.currentTarget.value);
                  }}
                  placeholder="검색어를 입력하세요"
                  className="w-full bg-transparent text-sm text-[#2C2C2C] outline-none placeholder:text-[#989898]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/infoPost/create')}
              className="flex h-10 w-10 cursor-pointer items-center justify-center gap-1 rounded-full bg-[#5E92F0] text-white transition-all duration-150 active:scale-95 sm:w-auto sm:rounded-lg sm:px-4"
            >
              <Plus size={16} strokeWidth={2.5} />

              <span className="hidden sm:inline">정보글 작성</span>
            </button>
          </div>
        </section>

        {/* 리스트 */}
        <section className="flex flex-col gap-3">
          {isLoading && (
            <div className="flex h-[250px] items-center justify-center text-sm text-[#989898]">
              정보글을 불러오는 중입니다.
            </div>
          )}

          {!isLoading &&
            infoPosts.map((infoPost) => (
              <Link
                key={infoPost.infoPostId}
                href={`/infoPost/${infoPost.infoPostId}`}
              >
                <div className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-4 py-4 transition-all duration-150 hover:bg-[#FAFAFA] active:scale-[0.995]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            backgroundColor:
                              categoryColorMap[infoPost.category],
                          }}
                          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-[#2C2C2C]/80"
                        >
                          {categoryMap[infoPost.category]}
                        </span>

                        <h2 className="truncate text-lg font-semibold text-[#2C2C2C]">
                          {infoPost.title}
                        </h2>
                      </div>

                      <p className="mt-2 truncate px-1 text-xs text-[#989898]">
                        연결된 모집글 {infoPost.recruitmentCount}개
                      </p>
                    </div>

                    {infoPost.thumbnailUrl && (
                      <img
                        src={infoPost.thumbnailUrl}
                        alt=""
                        className="h-16 w-20 shrink-0 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </div>
              </Link>
            ))}

          {!isLoading && infoPosts.length === 0 && (
            <div className="flex h-[250px] items-center justify-center rounded-xl bg-white text-sm text-[#989898]">
              등록된 정보글이 없습니다.
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
