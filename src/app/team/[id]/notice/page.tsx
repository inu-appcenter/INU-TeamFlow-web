'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useMyTeamNotices } from '@/hooks/useNoticeQuery';
import { useTeamDetail } from '@/hooks/useTeamQuery';
import { formatDate } from '@/utils/date/formatDate';
import { getTeamRoleLabel } from '@/utils/teamRole';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Pin,
  Plus,
  Search,
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function TeamNotice() {
  const router = useRouter();
  const params = useParams();

  const teamId = Number(params.id);
  const { data: team } = useTeamDetail(teamId);
  const isAdmin = team?.role === 'LEADER' || team?.role === 'MANAGER';

  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [page, setPage] = useState(1);

  const normalizedKeyword = keyword.replace(/\s/g, '');

  const { data: notices = [] } = useMyTeamNotices();

  const teamNotices = notices.filter((notice) => notice.teamId === teamId);

  const filtered = teamNotices.filter((notice) => {
    const title = notice.title.replace(/\s/g, '');
    const author = notice.authorName.replace(/\s/g, '');

    if (searchType === 'title') return title.includes(normalizedKeyword);
    if (searchType === 'author') return author.includes(normalizedKeyword);

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const unreadCount = teamNotices.filter((notice) => !notice.isRead).length;

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
    <main className="min-h-screen bg-[#F0F2F5] px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-[800px]">
        <header className="mt-12 mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/team/${teamId}`)}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            <h1 className="text-2xl font-bold text-[#2C2C2C]">팀 공지사항</h1>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex h-10 w-full items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white sm:w-[320px]">
              <div className="relative h-full">
                <select
                  value={searchType}
                  onChange={(e) => handleSearchTypeChange(e.target.value)}
                  className="h-full appearance-none rounded-l-full border-r-[0.5px] border-[#D6DDE5] bg-white px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
                >
                  <option value="title">제목</option>
                  <option value="author">작성자</option>
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

            {isAdmin && (
              <button
                type="button"
                onClick={() => router.push(`/team/${teamId}/notice/write`)}
                className="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#5E92F0] px-4 text-[15px] font-medium text-white transition-all duration-150 active:scale-95"
              >
                <Plus size={16} strokeWidth={2.5} />
                공지 작성
              </button>
            )}
          </div>
        </header>

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

        <section className="flex flex-col gap-3">
          {paged.map((notice) => (
            <Link
              key={notice.noticeId}
              href={`/team/${teamId}/notice/${notice.noticeId}`}
            >
              <div
                className={`h-[85px] items-center rounded-xl border-[0.5px] bg-white py-4 transition hover:bg-[#FAFAFA] ${
                  notice.isRead
                    ? 'border-[#D6DDE5] px-5'
                    : 'border-l-10 border-[#D6DDE5] border-l-[#5e92f0] px-4'
                }`}
              >
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <Pin
                      size={17}
                      strokeWidth={2.5}
                      className="shrink-0 text-[#5E92F0]"
                    />
                  )}

                  <h2 className="truncate text-lg font-semibold text-[#2C2C2C]">
                    {notice.title}
                  </h2>

                  {!notice.isRead && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E92F0]" />
                  )}
                </div>

                <p className="mt-1 text-xs text-[#989898]">
                  {getTeamRoleLabel(notice.teamRole)} · {notice.authorName} ·{' '}
                  {formatDate(notice.createdAt)}
                </p>
              </div>
            </Link>
          ))}

          {paged.length === 0 && (
            <div className="flex h-[200px] items-center justify-center rounded-xl bg-white text-sm text-[#989898]">
              등록된 공지사항이 없습니다.
            </div>
          )}
        </section>

        {totalPages > 1 && (
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
