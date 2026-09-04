'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMyTeamNotices } from '@moimi/core/hooks/useNoticeQuery';
import { getTeamRoleLabel } from '@/utils/teamRole';
import { categoryColorMap } from '@moimi/core/constants/category';
import { darkenColor } from '@/utils/color/darkenColor';

import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { formatDate } from '@/utils/date/formatDate';
import Header from '@/components/common/Header';
//이걸 복붙해서 사용해주세요
//Header 연결을 위한 입력 공간
//1. 페이지 이름을 입력해주세요
const pageName = '공지';

//2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
const isSearch = true;
//검색 필터를 입력해주세요
const searchFilter = [
  //예시 { value: 'title', label: '제목' },
  { value: 'title', label: '제목' },
  { value: 'team', label: '팀' },
];

//3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCreate = false;

//4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCategory = false;

const ITEMS_PER_PAGE = 8;
const PAGE_WINDOW_SIZE = 5;

export default function Notice() {
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

  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, i) => blockStart + i
  );

  const paged = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        {/* 헤더 */}
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          searchFilter={searchFilter}
          keyword={keyword}
          searchType={searchType}
          onKeywordChange={setKeyword}
          onSearchTypeChange={setSearchType}
        />

        {/* 안읽은 공지 배너 */}
        {unreadCount > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0]/5 px-6 py-4">
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
                    ? 'border-[#D6DDE5]/40'
                    : 'border-l-10 border-[#D6DDE5]/40 border-l-[#5e92f0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: categoryColorMap[notice.teamCategory],
                      color: darkenColor(
                        categoryColorMap[notice.teamCategory],
                        140
                      ),
                    }}
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
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
                  {notice.authorName} · {getTeamRoleLabel(notice.teamRole)} ·{' '}
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
              onClick={() =>
                setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
              }
              disabled={blockStart === 1}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {visiblePages.map((n) => (
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
              onClick={() =>
                setPage(Math.min(totalPages, blockStart + PAGE_WINDOW_SIZE))
              }
              disabled={blockEnd === totalPages}
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
