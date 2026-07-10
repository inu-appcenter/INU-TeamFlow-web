'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMyTeamNotices } from '@/hooks/useNoticeQuery';
import { getTeamRoleLabel } from '@/utils/teamRole';
import { categoryColorMap } from '@/constants/category';

import {
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { formatDate } from '@/utils/date/formatDate';

const ITEMS_PER_PAGE = 8;

export default function Notice() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [page, setPage] = useState(1);

  const { data: notices = [] } = useMyTeamNotices();

  const normalizedKeyword = keyword.replace(/\s/g, '');

  const filtered = notices.filter((notice) => {
    const title = notice.title.replace(/\s/g, '');
    const team = notice.teamName.replace(/\s/g, '');

    if (searchType === 'title') return title.includes(normalizedKeyword);
    if (searchType === 'team') return team.includes(normalizedKeyword);

    return true;
  });

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered]
  );

  const unreadCount = notices.filter((notice) => !notice.isRead).length;

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));

  const currentPage = Math.min(page, totalPages);

  const paged = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        {/* 헤더 */}
        <header className="mt-12 mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                router.push('/');
              }}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            <h1 className="text-2xl font-bold text-[#2C2C2C]">공지사항</h1>
          </div>

          {/* 검색바 */}
          <div className="flex h-10 w-full items-center overflow-hidden rounded-xl border-[0.5] border-[#D6DDE5] bg-white sm:w-[400px]">
            <div className="relative h-full">
              <select
                value={searchType}
                onChange={(e) => handleSearchTypeChange(e.target.value)}
                className="h-full appearance-none rounded-l-full border-r-[0.5] border-[#D6DDE5] bg-white px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
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
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full bg-transparent text-[#2C2C2C] outline-none placeholder:text-[#989898]"
              />
            </div>
          </div>
        </header>

        {/* 안읽은 공지 배너 */}
        {unreadCount > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0]/5 px-6 py-4">
            <Mail size={20} strokeWidth={2.5} className="text-[#5E92F0]" />
            <p className="text-base font-semibold text-[#2C2C2C]">
              아직 읽지 않은 공지가{' '}
              <span className="font-bold text-[#5E92F0]">{unreadCount}건</span>{' '}
              있어요
            </p>
          </div>
        )}

        {/* 리스트 */}
        <section className="flex flex-col gap-3">
          {paged.map((notice) => (
            <Link
              key={notice.noticeId}
              href={`/team/${notice.teamId}/notice/${notice.noticeId}?from=home`}
            >
              <div
                className={`rounded-xl border-[0.5px] bg-white px-4 py-4 transition hover:bg-[#FAFAFA] ${
                  notice.isRead
                    ? 'border-[#D6DDE5]'
                    : 'border-l-10 border-[#D6DDE5] border-l-[#5e92f0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: categoryColorMap[notice.teamCategory],
                    }}
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-[#2c2c2c]/80"
                  >
                    {notice.teamName}
                  </span>

                  <h2 className="truncate text-lg font-semibold text-[#2C2C2C]">
                    {notice.title}
                  </h2>

                  {!notice.isRead && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E92F0]" />
                  )}
                </div>

                <p className="mt-2 truncate px-1 text-xs text-[#989898]">
                  {notice.authorName} ·{getTeamRoleLabel(notice.teamRole)} ·{' '}
                  {formatDate(notice.createdAt)}
                </p>
              </div>
            </Link>
          ))}

          {paged.length === 0 && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#989898]">
              공지사항이 없습니다.
            </div>
          )}
        </section>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex items-center justify-center px-1 text-[16px] font-semibold transition-all duration-150 active:scale-90 ${
                  currentPage === n
                    ? 'text-[#5E92F0]'
                    : 'cursor-pointer text-[#2c2c2c]/50'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
