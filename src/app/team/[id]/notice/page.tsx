'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { notices } from '@/mocks/notices';

import { ChevronDown, ChevronLeft, Search } from 'lucide-react';

export default function TeamNotice() {
  const router = useRouter();
  const params = useParams();

  const teamId = Number(params.id);

  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');

  const normalizedKeyword = keyword.replace(/\s/g, '');

  const teamNotices = notices.filter((notice) => notice.teamId === teamId);

  const filtered = teamNotices.filter((notice) => {
    const title = notice.title.replace(/\s/g, '');
    const team = notice.teamName.replace(/\s/g, '');

    if (searchType === 'title') {
      return title.includes(normalizedKeyword);
    }

    if (searchType === 'team') {
      return team.includes(normalizedKeyword);
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 py-6 sm:px-6">
      <header className="mx-auto mt-12 mb-4 flex max-w-[800px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="cursor-pointer text-[#2C2C2C]"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>

          <h1 className="text-2xl font-bold text-[#2C2C2C]">
            팀 공지사항 페이지 수정할 예정
          </h1>
        </div>

        <div className="flex h-10 w-full items-center overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white md:w-[400px]">
          <div className="relative h-full">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="h-full appearance-none rounded-l-full border-r-[0.5px] border-[#D6DDE5] bg-white px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
            >
              <option value="title">제목</option>
              <option value="team">팀명</option>
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
      </header>

      <section className="mx-auto flex max-w-3xl flex-col gap-3">
        {filtered.map((notice) => (
          <Link
            key={notice.noticeId}
            href={`/team/${teamId}/notice/${notice.noticeId}`}
          >
            <div className="rounded-xl bg-white px-6 py-4 transition hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg font-semibold text-[#989898]">
                  [ {notice.teamName} ]
                </p>

                <h2 className="truncate text-lg font-semibold text-[#2C2C2C]">
                  {notice.title}
                </h2>
              </div>

              <p className="mt-1 text-xs text-[#989898]/80">
                {notice.createdAt}
              </p>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl bg-white px-6 py-10 text-center text-sm text-[#989898]">
            등록된 공지사항이 없습니다.
          </div>
        )}
      </section>
    </main>
  );
}
