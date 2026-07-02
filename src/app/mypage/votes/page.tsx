'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import { useMyVotes } from '@/hooks/useMypageVoteQuery';
import type { MyVote, VoteTab } from '@/types/mypageVote';

const tabs: { label: string; value: VoteTab }[] = [
  { label: '전체', value: 'ALL' },
  { label: '진행중', value: 'OPENED' },
  { label: '종료', value: 'CLOSED' },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (time: string | null) => {
  if (!time) return '';
  return time.slice(0, 5);
};

export default function VotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<VoteTab>('ALL');

  const { data: votes = [], isLoading, isError } = useMyVotes();

  const sortedVotes = [...votes].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  const filteredVotes = sortedVotes.filter((vote) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'OPENED') return vote.isOpened;
    return !vote.isOpened;
  });

  return (
    <main className="min-h-screen px-3 py-6 pb-28 sm:px-6 sm:pt-10">
      <NotificationButton />

      <header className="mx-auto mt-10 mb-5 flex max-w-[1180px] items-center gap-3 px-1">
        <button
          onClick={() => router.push('/mypage')}
          className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>

        <h1 className="text-[26px] font-bold text-[#2C2C2C]">내 투표</h1>
      </header>

      <section className="mx-auto max-w-[1180px]">
        <section className="animate-modal-pop min-h-[600px] rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5 transition-all duration-200 sm:p-7">
          <div className="mb-6 border-b border-[#EDF1F5] pb-4">
            <div className="flex flex-wrap gap-2 text-[15px] font-semibold">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-2xl px-4 py-2 transition-all duration-150 active:scale-95 ${
                    activeTab === tab.value
                      ? 'bg-[#5E92F0] text-white shadow-sm'
                      : 'border border-[#D6DDE5] bg-white text-[#2C2C2C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="thin-scrollbar grid max-h-[500px] gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                투표 내역을 불러오는 중입니다.
              </div>
            ) : isError ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                투표 내역을 불러오지 못했습니다.
              </div>
            ) : filteredVotes.length === 0 ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                투표 내역이 없습니다.
              </div>
            ) : (
              filteredVotes.map((vote) => (
                <VoteCard
                  key={vote.voteId}
                  vote={vote}
                  onClick={() =>
                    router.push(`/team/${vote.teamId}/vote/${vote.voteId}`)
                  }
                />
              ))
            )}
          </div>
        </section>
      </section>

      <BottomNav />
    </main>
  );
}

function VoteCard({ vote, onClick }: { vote: MyVote; onClick: () => void }) {
  const completedCount = vote.completedVoterList.length;
  const uncompletedCount = vote.uncompletedVoterList.length;
  const totalCount = completedCount + uncompletedCount;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[200px] flex-col justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 truncate text-[13px] font-semibold text-[#5E92F0]">
              {vote.teamName}
            </p>

            <h2 className="line-clamp-2 text-[19px] font-bold text-[#2C2C2C]">
              {vote.title}
            </h2>
          </div>

          <span
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold ${
              vote.isOpened
                ? 'bg-[#DDF7E5] text-[#2F8F4E]'
                : 'bg-[#EEF1F5] text-[#989898]'
            }`}
          >
            {vote.isOpened ? '진행중' : '종료'}
          </span>
        </div>

        <p className="line-clamp-2 text-[14px] leading-6 text-[#5C5C5C]">
          {vote.description}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-[13px] text-[#989898]">
          <span>생성일 {formatDate(vote.createdDate)}</span>
          <span>
            참여 {completedCount}/{totalCount}명
          </span>
        </div>

        <div className="flex items-center justify-between text-[13px] text-[#989898]">
          <span>후보 날짜 {vote.dates.length}개</span>

          <span>
            {vote.isAllDay
              ? '하루 종일'
              : `${formatTime(vote.dailyTimeStart)}~${formatTime(
                  vote.dailyTimeEnd
                )}`}
          </span>
        </div>
      </div>
    </button>
  );
}