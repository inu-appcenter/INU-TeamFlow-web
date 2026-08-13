'use client';

import { useEffect, useRef, useState } from 'react';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useInfoPostScraps, useRecruitmentScraps } from '@/hooks/useScrapQuery';
import Header from '@/components/common/Header';
import ContentCard from '@/components/common/ContentCard';
import { formatDate } from '@/utils/date/formatDate';
import { getDday } from '@/utils/date/getDday';

//이걸 복붙해서 사용해주세요
//DetailTopBar 연결을 위한 입력 공간
//1. 페이지 이름을 입력해주세요
const pageName = '스크랩';

//2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
const isSearch = false;
//검색 필터를 입력해주세요
const searchFilter = [
  //{ value: 'title', label: '제목' },
  { value: 'title', label: '제목' },
  { value: 'announcementTitle', label: '정보글' },
];

//3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCreate = false;

//4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCategory = true;
//카테고리 필터를 입력해주세요
const categories = [
  //{ value: 'title', label: '제목' },
  { value: 'recruitment', label: '모집글' },
  { value: 'infoPost', label: '정보글' },
];

const ITEMS_PER_PAGE = 10;

type ScrapCategory = 'recruitment' | 'infoPost';

export default function Scrap() {
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] =
    useState<ScrapCategory>('recruitment');

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { errorMessage, showErrorMessage } = useErrorToast();

  const recruitmentScrapsQuery = useRecruitmentScraps(
    ITEMS_PER_PAGE,
    selectedCategory === 'recruitment'
  );

  const infoPostScrapsQuery = useInfoPostScraps(
    ITEMS_PER_PAGE,
    selectedCategory === 'infoPost'
  );

  const recruitmentScraps =
    recruitmentScrapsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  const infoPostScraps =
    infoPostScrapsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  const isLoading =
    selectedCategory === 'recruitment'
      ? recruitmentScrapsQuery.isLoading
      : infoPostScrapsQuery.isLoading;
  const isError =
    selectedCategory === 'recruitment'
      ? recruitmentScrapsQuery.isError
      : infoPostScrapsQuery.isError;

  const isEmpty =
    !isLoading &&
    !isError &&
    (selectedCategory === 'recruitment'
      ? recruitmentScraps.length === 0
      : infoPostScraps.length === 0);
  console.log('infoPost pages', infoPostScrapsQuery.data?.pages);
  console.log('infoPost hasNextPage', infoPostScrapsQuery.hasNextPage);
  console.log(
    'infoPost isFetchingNextPage',
    infoPostScrapsQuery.isFetchingNextPage
  );
  const handleCategoryChange = (category: string) => {
    if (category !== 'recruitment' && category !== 'infoPost') {
      return;
    }

    setSelectedCategory(category);
  };

  useEffect(() => {
    if (!isError) {
      return;
    }

    showErrorMessage('스크랩 목록을 불러오지 못했습니다');
  }, [isError, showErrorMessage]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        if (
          selectedCategory === 'recruitment' &&
          recruitmentScrapsQuery.hasNextPage &&
          !recruitmentScrapsQuery.isFetchingNextPage
        ) {
          void recruitmentScrapsQuery.fetchNextPage();
        }

        if (
          selectedCategory === 'infoPost' &&
          infoPostScrapsQuery.hasNextPage &&
          !infoPostScrapsQuery.isFetchingNextPage
        ) {
          void infoPostScrapsQuery.fetchNextPage();
        }
      },
      {
        rootMargin: '200px',
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [
    selectedCategory,
    recruitmentScrapsQuery.hasNextPage,
    recruitmentScrapsQuery.isFetchingNextPage,
    recruitmentScrapsQuery.fetchNextPage,
    infoPostScrapsQuery.hasNextPage,
    infoPostScrapsQuery.isFetchingNextPage,
    infoPostScrapsQuery.fetchNextPage,
  ]);

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-100 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <div className="mx-auto mb-20 max-w-[1180px]">
        {/* 헤더 */}
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          searchFilter={searchFilter}
          categories={categories}
          keyword={keyword}
          searchType={searchType}
          selectedCategory={selectedCategory}
          onKeywordChange={setKeyword}
          onSearchTypeChange={setSearchType}
          onCategoryChange={handleCategoryChange}
        />

        {/* 리스트 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoading && (
            <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
              스크랩을 불러오는 중입니다
            </div>
          )}

          {selectedCategory === 'recruitment' &&
            recruitmentScraps.map((recruitment) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const endDate = new Date(recruitment.endAt);
              endDate.setHours(0, 0, 0, 0);

              const isClosed =
                endDate < today || recruitment.status === 'CLOSED';

              return (
                <ContentCard
                  key={recruitment.recruitmentId}
                  cardType="recruitment"
                  category={recruitment.category}
                  title={recruitment.title}
                  content={recruitment.status}
                  cardStatus={isClosed ? 'CLOSED' : 'OPEN'}
                  path={`/recruitment/${recruitment.recruitmentId}`}
                  startAt={formatDate(recruitment.createdAt)}
                  endAt={formatDate(recruitment.endAt)}
                  dDay={getDday(recruitment.endAt)}
                />
              );
            })}

          {selectedCategory === 'infoPost' &&
            infoPostScraps.map((infoPost) => (
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

          {isEmpty && (
            <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
              {selectedCategory === 'recruitment'
                ? '스크랩한 모집글이 없습니다'
                : '스크랩한 정보글이 없습니다'}
            </div>
          )}
        </section>

        {/* 인피니티 스크롤 */}
        <div ref={loadMoreRef} className="h-10" />

        {(recruitmentScrapsQuery.isFetchingNextPage ||
          infoPostScrapsQuery.isFetchingNextPage) && (
          <div className="flex h-16 items-center justify-center text-sm text-[#989898]">
            더 불러오는 중입니다
          </div>
        )}
      </div>
    </main>
  );
}
