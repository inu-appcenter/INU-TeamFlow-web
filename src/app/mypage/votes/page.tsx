'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import ContentCard from '@/components/common/ContentCard';
import Header from '@/components/common/Header';

import { formatDate } from '@/utils/date/formatDate';
import { useMyVotes } from '@/hooks/useMypageVoteQuery';
import type { VoteTab } from '@/types/mypageVote';

const categories: { label: string; value: VoteTab }[] = [
  { label: '전체', value: 'ALL' },
  { label: '진행중', value: 'ONGOING' },
  { label: '종료', value: 'ENDED' },
];
//이걸 복붙해서 사용해주세요
//Header 연결을 위한 입력 공간
//1. 페이지 이름을 입력해주세요
const pageName = '내 투표';

//2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
const isSearch = false;

//3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCreate = false;

//4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCategory = true;

const formatTime = (time: string | null) => {
  if (!time) return '';
  return time.slice(0, 5);
};

export default function VotesPage() {
  const [selectedCategory, setSelectedCategory] = useState<VoteTab>('ALL');

  const { data: votes = [], isLoading, isError } = useMyVotes();

  const sortedVotes = [...votes].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  const filteredVotes = sortedVotes.filter((vote) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'ONGOING') return vote.isOpened;
    return !vote.isOpened;
  });

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <NotificationButton />
      <div className="mx-auto mb-20 max-w-[1180px]">
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(category) =>
            setSelectedCategory(category as VoteTab)
          }
        />
        <section className="mx-auto max-w-[1180px]">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <ContentCard
                  key={vote.voteId}
                  cardType="vote"
                  category={vote.teamCategory}
                  title={vote.title}
                  content={vote.description}
                  path={`/team/${vote.teamId}/vote/${vote.voteId}`}
                  createdAt={formatDate(vote.createdDate)}
                  completedCount={vote.completedVoterList.length}
                  totalCount={
                    vote.completedVoterList.length +
                    vote.uncompletedVoterList.length
                  }
                  dateCount={vote.dates.length}
                  time={
                    vote.isAllDay
                      ? '하루 종일'
                      : `${formatTime(vote.dailyTimeStart)}~${formatTime(
                          vote.dailyTimeEnd
                        )}`
                  }
                  cardStatus={vote.isOpened ? 'ONGOING' : 'ENDED'}
                />
              ))
            )}
          </section>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
