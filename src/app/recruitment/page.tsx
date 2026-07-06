'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useRecruitments } from '@/hooks/useRecruitmentQuery';
import { getDday } from '@/utils/date/getDday';

import { ChevronLeft, Search, ChevronDown, Plus } from 'lucide-react';
import { formatDate } from '@/utils/date/formatDate';

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const categories = [
  { label: '전체', value: 'ALL' },
  { label: '공모전', value: 'CONTEST' },
  { label: '스터디', value: 'STUDY' },
  { label: '프로젝트', value: 'PROJECT' },
  { label: '동아리', value: 'CLUB' },
  { label: '기타', value: 'ETC' },
];

const categoryColorMap = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

export default function Recruitment() {
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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
        : announcementTitle.includes(normalizedKeyword);

    return matchesCategory && matchesKeyword;
  });

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        {/* 헤더 */}
        <header className="mt-12 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            <h1 className="text-2xl font-bold text-[#2C2C2C]">모집</h1>
          </div>
        </header>

        {/* 카테고리 */}
        <section className="mb-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`sm:text-md cursor-pointer rounded-2xl border-[0.5px] px-3.5 py-1.5 text-[18px] font-normal ${
                selectedCategory === category.value
                  ? 'border-[#D6DDE5] bg-[#5E92F0] text-white'
                  : 'border-[#D6DDE5] bg-white text-[#2C2C2C]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </section>

        {/* 검색바 */}
        <section className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex h-10 flex-1 items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white md:w-[400px] md:flex-none">
            <div className="relative h-full">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="h-full appearance-none rounded-l-full border-r-[0.5px] border-[#D6DDE5] bg-white px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
              >
                <option value="title">제목</option>
                <option value="announcementTitle">정보글</option>
              </select>

              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#2C2C2C]">
                <ChevronDown size={14} />
              </span>
            </div>

            <div className="flex flex-1 items-center gap-3 px-3">
              <Search size={18} className="text-[#989898]" />

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full bg-transparent text-[#2C2C2C] outline-none placeholder:text-[#989898]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/recruitment/create')}
            className="flex h-10 w-10 cursor-pointer items-center justify-center gap-1 rounded-full bg-[#5E92F0] text-white transition-all duration-150 active:scale-95 sm:w-auto sm:rounded-lg sm:px-4"
          >
            <Plus size={16} strokeWidth={2.5} />

            <span className="hidden sm:inline">모집글 작성</span>
          </button>
        </section>

        {/* 리스트 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((recruitment) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const endDate = new Date(recruitment.endAt);
            endDate.setHours(0, 0, 0, 0);

            const isClosed = endDate < today || recruitment.status === 'CLOSED';

            return (
              <div
                key={recruitment.recruitmentId}
                className="cursor-pointer rounded-2xl border-l-15 bg-white p-6"
                style={{ borderColor: categoryColorMap[recruitment.category] }}
                onClick={() =>
                  router.push(`/recruitment/${recruitment.recruitmentId}`)
                }
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-lg font-bold text-[#2C2C2C]">
                    [ {categoryMap[recruitment.category]} ]
                  </span>

                  <h2 className="truncate text-lg font-bold text-[#2C2C2C]">
                    {recruitment.title}
                  </h2>
                </div>

                <p
                  className={`mt-2 text-sm ${
                    recruitment.announcementTitle
                      ? 'text-[#2C2C2C]'
                      : 'text-[#B0B0B0]'
                  }`}
                >
                  {recruitment.announcementTitle || '연결된 정보글이 없습니다'}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] text-[#989898]">
                      {formatDate(recruitment.endAt)}
                    </p>

                    <span className="text-[13px] font-medium text-[#5E92F0]">
                      {getDday(recruitment.endAt)}
                    </span>
                  </div>

                  <span
                    className={`rounded-xl px-3 py-1 text-sm font-medium ${
                      isClosed
                        ? 'bg-[#EEF1F5] text-[#989898]'
                        : 'bg-[#A7ECA7] text-[#1F4D1A]'
                    }`}
                  >
                    {isClosed ? '모집마감' : '모집중'}
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
