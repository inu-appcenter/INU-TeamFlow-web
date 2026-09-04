'use client';

import Card from '@/components/main/Card';
import { useTeamDetail } from '@moimi/core/hooks/team/useTeamQuery';
import { useTeamVotes } from '@moimi/core/hooks/useVoteQuery';
import { categoryMap, categoryColorMap } from '@moimi/core/constants/category';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useMemo, useState } from 'react';

const ITEMS_PER_PAGE = 8;
const PAGE_WINDOW_SIZE = 5;

export default function TeamVotePage() {
  const router = useRouter();
  const params = useParams();

  const teamId = Number(params.id);

  const { data: team, isLoading: isTeamLoading } = useTeamDetail(teamId);
  const { data: teamVotes = [], isLoading: isVotesLoading } =
    useTeamVotes(teamId);
  const { errorMessage, showErrorMessage } = useErrorToast();

  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...teamVotes].sort((a, b) => b.createdDate.localeCompare(a.createdDate)),
    [teamVotes]
  );

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

  if (isTeamLoading || isVotesLoading) return null;

  if (!team) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">존재하지 않는 팀입니다.</p>
      </main>
    );
  }

  const handleVoteClick = (vote: (typeof teamVotes)[number]) => {
    if (!vote.isVoter && !vote.isCreator) {
      showErrorMessage('투표 참여자가 아니에요');
      return;
    }
    router.push(`/team/${teamId}/vote/${vote.voteId}`);
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: categoryColorMap[team.category] }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="cursor-pointer text-[#2C2C2C]"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>

              <h1 className="text-[22px] font-bold text-[#2C2C2C]">투표</h1>
            </div>

            <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
              {categoryMap[team.category]}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 sm:px-8">
            <section className="flex flex-col">
              {paged.map((vote) => {
                const completed = vote.completedVoterList?.length ?? 0;
                const total =
                  (vote.completedVoterList?.length ?? 0) +
                  (vote.uncompletedVoterList?.length ?? 0);

                const progress = total === 0 ? 0 : (completed / total) * 100;
                const canAccess = vote.isVoter || vote.isCreator;

                return (
                  <button
                    key={vote.voteId}
                    onClick={() => handleVoteClick(vote)}
                    className={`border-b-[0.5px] border-[#D6DDE5] py-6 text-left transition-all duration-200 ease-in-out ${
                      canAccess
                        ? 'active:scale-[0.99]'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="truncate text-[19px] font-semibold text-[#2C2C2C]">
                          {vote.title}
                        </h2>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${
                            vote.isOpened
                              ? 'bg-[#E8F1FF] text-[#5E92F0]'
                              : 'bg-[#EEF1F5] text-[#989898]'
                          }`}
                        >
                          {vote.isOpened ? '진행중' : '마감'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="mt-1 line-clamp-1 text-sm text-[#989898]">
                          {vote.description}
                        </p>
                        <p className="mt-1 shrink-0 text-xs text-[#989898]">
                          {vote.createdDate}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-[#989898]">
                        참여율 {completed}/{total}
                      </span>

                      <span className="text-[11px] font-medium text-[#5E92F0]">
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E6EAF0]">
                      <div
                        className="h-full rounded-full bg-[#5E92F0] transition-all duration-300 ease-in-out"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </button>
                );
              })}

              {paged.length === 0 && (
                <div className="flex h-[300px] items-center justify-center text-sm text-[#989898]">
                  아직 등록된 투표가 없어요
                </div>
              )}
            </section>

            {/* 페이지네이션 */}
            {sorted.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-6">
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
                    type="button"
                    key={n}
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
        </Card>
      </section>
      {errorMessage && (
        <div className="animate-modal-pop absolute top-32 left-1/2 z-300 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}
    </main>
  );
}
