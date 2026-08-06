'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { categoryMap } from '@/constants/contentCard';
import { useErrorToast } from '@/hooks/useErrorToast';
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

const createdAt = '2026-07-31T18:54:42.237763'; //임시값
export default function Scrap() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState('recruitment');
  const { errorMessage, showErrorMessage } = useErrorToast();
  const date = createdAt.split('T')[0];
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
          onCategoryChange={setSelectedCategory}
        />

        {/* 리스트 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ContentCard
            path="recruitment/"
            cardType="recruitment"
            category={'CONTEST'}
            title={'제목'}
            content={categoryMap['CONTEST']}
            cardStatus="OPEN"
            endAt={formatDate(createdAt)}
            startAt={formatDate(createdAt)}
            dDay={getDday(createdAt)}
          />
          <ContentCard
            path="infoPost/"
            cardType="infoPost"
            category={'STUDY'}
            title={'제목'}
            content={'제목'}
            cardStatus="CLOSED"
            createdAt={formatDate(createdAt)}
          />
          <ContentCard
            path="application/"
            cardType="application"
            category={'PROJECT'}
            title={'제목'}
            content={'제목'}
            cardStatus="WAITING"
            createdAt={formatDate(createdAt)}
          />
          <ContentCard
            path={`team/${5}/notice/`}
            cardType="notice"
            category={'CLUB'}
            title={'제목'}
            content={'제목'}
            cardStatus="READ"
            createdAt={formatDate(createdAt)}
            updatedAt={formatDate(createdAt)}
          />
          <ContentCard
            path="recruitment/"
            cardType="recruitment"
            category={'ETC'}
            title={'제목'}
            content={categoryMap['CONTEST']}
            cardStatus="UNREAD"
            endAt={formatDate(createdAt)}
            startAt={formatDate(createdAt)}
            dDay={getDday(createdAt)}
          />
          <ContentCard
            path="infoPost/"
            cardType="infoPost"
            category={'EXTERNAL_ACTIVITY'}
            title={'제목'}
            content={'제목'}
            cardStatus="ACCEPTED"
            createdAt={formatDate(createdAt)}
          />
          <ContentCard
            cardType="notice"
            category={'INTERN'}
            title={'제목'}
            content={'제목'}
            cardStatus="DECLINED"
            createdAt={formatDate(createdAt)}
            updatedAt={formatDate(createdAt)}
          />
          <ContentCard
            cardType="notice"
            category={'CAREER_ADVICE'}
            title={'제목'}
            content={'제목'}
            cardStatus="CANCELLED"
            createdAt={formatDate(createdAt)}
            updatedAt={formatDate(createdAt)}
          />
          <ContentCard
            cardType="notice"
            category={'CASUAL_TALK'}
            title={'제목'}
            content={'제목'}
            cardStatus="CANCELLED"
            createdAt={formatDate(createdAt)}
            updatedAt={formatDate(createdAt)}
          />
          <ContentCard
            cardType="notice"
            category={'INFO_SHARING'}
            title={'제목'}
            content={'제목'}
            cardStatus="CANCELLED"
            createdAt={formatDate(createdAt)}
            updatedAt={formatDate(createdAt)}
          />
        </section>
      </div>
    </main>
  );
}
