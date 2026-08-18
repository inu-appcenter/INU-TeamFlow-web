'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRecruitments } from '@/hooks/useRecruitmentQuery';
import { getDday } from '@/utils/date/getDday';

import { formatDate } from '@/utils/date/formatDate';
import { categoryFilterOptions } from '@/constants/category';
import { useErrorToast } from '@/hooks/useErrorToast';
import Header from '@/components/common/Header';
import ContentCard from '@/components/common/ContentCard';

//Header 연결을 위한 입력 공간
//1. 페이지 이름을 입력해주세요
const pageName = '모집';

//2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
const isSearch = true;
//검색 필터를 입력해주세요
const searchFilter = [
  { value: 'title', label: '제목' },
  { value: 'announcementTitle', label: '정보글' },
];

//3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCreate = true;

//4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCategory = true;

export default function Recruitment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
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

  const normalizedKeyword = keyword.replace(/\s/g, '');

  const { data: recruitmentData } = useRecruitments(0, 20);
  const recruitments = recruitmentData?.content ?? [];

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
          categories={categoryFilterOptions}
          keyword={keyword}
          searchType={searchType}
          selectedCategory={selectedCategory}
          onKeywordChange={setKeyword}
          onSearchTypeChange={setSearchType}
          onCategoryChange={setSelectedCategory}
        />

        {/* 리스트 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((recruitment) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const endDate = new Date(recruitment.endAt);
            endDate.setHours(0, 0, 0, 0);

            const isClosed = endDate < today || recruitment.status === 'CLOSED';
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
        </section>
      </div>
    </main>
  );
}
