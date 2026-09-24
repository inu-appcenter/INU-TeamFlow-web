// src/app/admin/suspended-users/page.tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/main/Card';
import ReleaseSanctionButton from '@/components/admin/ReleaseSanctionButton';
import { useSuspendedUsers } from '@/hooks/admin/useSuspendedUsers';
import { SANCTION_TYPE_LABEL } from '@moimi/core/types/admin';
import {
  REPORT_REASON_LABEL,
  type ReportReason,
} from '@moimi/core/types/report';

const PAGE_SIZE = 15;
const PAGE_WINDOW_SIZE = 5;

const GRID_COLS = 'grid-cols-[1fr_80px_1.2fr_90px_100px_100px_72px]';

// 서버는 UTC ISO로 주니까 slice(0, 10) 대신 로컬(KST) 기준 날짜로 변환
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

// reason이 enum 값(SPAM 등)으로 오면 라벨로, 자유 텍스트면 그대로 표시
const getReasonLabel = (reason: string) =>
  REPORT_REASON_LABEL[reason as ReportReason] ?? reason;

export default function SuspendedUsersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useSuspendedUsers({
    page: page - 1, // 백엔드는 0-based, 화면 표시는 1-based
    size: PAGE_SIZE,
  });

  const users = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const blockStart =
    Math.floor((page - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages =
    totalPages === 0
      ? []
      : Array.from(
          { length: blockEnd - blockStart + 1 },
          (_, i) => blockStart + i
        );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2C2C2C]">정지 계정</h1>
      <p className="mt-1 text-sm text-[#9C9C9C]">
        현재 정지 또는 영구정지된 계정 {totalCount}개가 있어요
      </p>

      <Card className="mt-4 p-0">
        {/* 목록 헤더 */}
        <div
          className={`grid ${GRID_COLS} items-center gap-3 border-b-[0.5px] border-[#D6DDE5] px-6 pt-4 pb-2.5 text-xs font-medium text-[#9C9C9C]`}
        >
          <span>사용자</span>
          <span>조치</span>
          <span>사유</span>
          <span>처리자</span>
          <span>조치일</span>
          <span>해제 예정일</span>
          <span />
        </div>

        {/* 목록 */}
        <div>
          {isLoading && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#9C9C9C]">
              불러오는 중...
            </div>
          )}

          {isError && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#B32424]">
              목록을 불러오지 못했어요
            </div>
          )}

          {!isLoading && !isError && users.length === 0 && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#9C9C9C]">
              정지된 계정이 없어요
            </div>
          )}

          {!isLoading &&
            !isError &&
            users.map((user) => (
              <div
                key={`${user.userId}-${user.reportId}`}
                className={`grid ${GRID_COLS} items-center gap-3 border-b-[0.5px] border-[#F0F2F5] px-6 py-2.5 transition hover:bg-[#F6F8FA]`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#2C2C2C]">{user.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#9C9C9C]">
                    {user.username}
                  </p>
                </div>
                <span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      user.action === 'BAN'
                        ? '-ml-4 bg-[#FFDDDD] text-[#B32424]'
                        : '-ml-2 bg-[#FFF4E5] text-[#F0A35E]'
                    }`}
                  >
                    {SANCTION_TYPE_LABEL[user.action]}
                  </span>
                </span>
                <span className="truncate text-sm text-[#6B6B6B]">
                  {getReasonLabel(user.reason)}
                </span>
                <span className="truncate text-sm text-[#6B6B6B]">
                  {user.handledBy}
                </span>
                <span className="text-sm text-[#9C9C9C]">
                  {formatDate(user.handledAt)}
                </span>
                <span className="text-sm text-[#9C9C9C]">
                  {user.suspendedUntil ? formatDate(user.suspendedUntil) : '-'}
                </span>
                <span className="flex justify-end">
                  <ReleaseSanctionButton
                    reportId={user.reportId}
                    targetName={user.name}
                    size="sm"
                  />
                </span>
              </div>
            ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-2 border-t-[0.5px] border-[#D6DDE5] py-4">
            <button
              type="button"
              onClick={() =>
                setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
              }
              disabled={blockStart === 1}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            {visiblePages.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex items-center justify-center px-1 text-[15px] font-semibold transition-all duration-150 active:scale-90 ${
                  page === n
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
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
