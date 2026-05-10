'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { recruitments } from '@/mocks/recruitments';

import { ChevronLeft, Search, ChevronDown, Plus } from 'lucide-react';

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

export default function Recruitment() {
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const normalizedKeyword = keyword.replace(/\s/g, '');

  const filtered = recruitments.filter((recruitment) => {
    const title = recruitment.title.replace(/\s/g, '');
    const announcementTitle = recruitment.announcementTitle.replace(/\s/g, '');

    const matchesCategory =
      selectedCategory === 'ALL' || recruitment.category === selectedCategory;

    const matchesKeyword =
      searchType === 'title'
        ? title.includes(normalizedKeyword)
        : announcementTitle.includes(normalizedKeyword);

    return matchesCategory && matchesKeyword;
  });

  return (
    <main className="min-h-screen p-6">
      {/* 헤더 */}
      <header className="mt-12 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push('/');
            }}
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
            className={`text-md cursor-pointer rounded-2xl border-[0.5] px-3 py-1.5 font-normal ${
              selectedCategory === category.value
                ? 'border-[#D6DDE5] bg-[#5E92F0] text-white'
                : 'border-[#D6DDE5] bg-[#FBFBFB] text-[#2C2C2C]'
            }`}
          >
            {category.label}
          </button>
        ))}

        {/* PC 버튼 */}
        <button className="ml-auto hidden cursor-pointer items-center gap-1 rounded-lg bg-[#5E92F0] px-4 py-2 text-sm font-medium text-white md:flex">
          <Plus size={14} strokeWidth={2.5} />
          모집글 쓰기
        </button>
      </section>

      {/* 검색바 */}
      <section className="mb-5 flex items-center gap-4">
        <div className="flex h-10 flex-1 items-center overflow-hidden rounded-2xl border-[0.5] border-[#D6DDE5] bg-white md:w-[400px] md:flex-none">
          <div className="relative h-full">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="h-full appearance-none rounded-l-full border-r-[0.5] border-[#D6DDE5] bg-white px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
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

        {/* 모바일 버튼 */}
        <button className="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#5E92F0] px-3 text-sm font-medium text-white md:hidden">
          <Plus size={14} strokeWidth={2.5} />
          모집글 쓰기
        </button>
      </section>

      {/* 리스트 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((recruitment) => (
          <div
            key={recruitment.recruitmentId}
            className="cursor-pointer rounded-2xl bg-white p-6"
          >
            <h2 className="text-lg font-bold text-[#2C2C2C]">
              [ {categoryMap[recruitment.category]} ] {recruitment.title}
            </h2>

            <p className="mt-2 text-sm text-[#2C2C2C]">
              {recruitment.announcementTitle}
            </p>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-[#989898]">
                {recruitment.createdAt} ~ {recruitment.endAt}
              </p>

              <span
                className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                  recruitment.status === 'OPEN'
                    ? 'bg-[#A7ECA7] text-[#2C2C2C]'
                    : 'bg-[#F67F8F] text-white'
                }`}
              >
                {recruitment.status === 'OPEN' ? '모집중' : '모집마감'}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
