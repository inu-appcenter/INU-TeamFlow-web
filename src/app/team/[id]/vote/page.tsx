'use client';

import Card from '@/components/main/Card';
import { useTeamDetail } from '@/hooks/useTeamQuery';
import { useTeamVotes } from '@/hooks/useVoteQuery';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

export default function TeamVotePage() {
  const router = useRouter();
  const params = useParams();

  const teamId = Number(params.id);

  const { data: team, isLoading: isTeamLoading } = useTeamDetail(teamId);
  const { data: teamVotes = [], isLoading: isVotesLoading } =
    useTeamVotes(teamId);

  if (isTeamLoading || isVotesLoading) return null;

  if (!team) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">존재하지 않는 팀입니다.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
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
                <ChevronLeft
                  size={24}
                  strokeWidth={2.5}
                  className="sm:h-7 sm:w-7"
                />
              </button>

              <h1 className="text-[22px] font-bold text-[#2C2C2C]">투표</h1>
            </div>

            <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
              {categoryMap[team.category]}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 sm:px-8">
            <section className="flex flex-col">
              {teamVotes.map((vote) => {
                const completed = vote.completedVoterList?.length ?? 0;
                const total =
                  (vote.completedVoterList?.length ?? 0) +
                  (vote.uncompletedVoterList?.length ?? 0);

                const progress = total === 0 ? 0 : (completed / total) * 100;

                return (
                  <button
                    key={vote.voteId}
                    onClick={() =>
                      router.push(`/team/${teamId}/vote/${vote.voteId}`)
                    }
                    className="border-b-[0.5px] border-[#D6DDE5] py-6 text-left transition-all duration-200 ease-in-out active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="truncate text-[19px] font-semibold text-[#2C2C2C]">
                          {vote.title}
                        </h2>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-semibold ${
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

              {teamVotes.length === 0 && (
                <div className="flex h-[300px] items-center justify-center text-sm text-[#989898]">
                  아직 등록된 투표가 없어요
                </div>
              )}
            </section>
          </div>
        </Card>
      </section>
    </main>
  );
}
