'use client';

import Card from '@/components/main/Card';
import { teamDetails } from '@/mocks/teams';
import { eventVoteTimeSlots, votes } from '@/mocks/votes';
import VoteForm from '@/components/vote/VoteForm';
import VoteResult from '@/components/vote/VoteResult';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

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

export default function VoteDetailPage() {
  const router = useRouter();
  const params = useParams();

  const teamId = Number(params.id);
  const voteId = Number(params.voteId);

  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [participantTab, setParticipantTab] = useState<
    'completed' | 'uncompleted'
  >('completed');
  const [isVoting, setIsVoting] = useState(false);
  const [isSelectingResult, setIsSelectingResult] = useState(false);

  const team = teamDetails.find((item) => item.teamId === teamId);
  const vote = votes.find((item) => item.voteId === voteId);

  if (!team || !vote) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">
          존재하지 않는 투표입니다.
        </p>
      </main>
    );
  }

  const voteSlots = eventVoteTimeSlots.filter((slot) => slot.voteId === voteId);
  const voteDates = vote.dates;

  const startHour = Number(vote.dailyTimeStart?.slice(0, 2));
  const endHour = Number(vote.dailyTimeEnd?.slice(0, 2));

  const voteHours = vote.isAllDay
    ? [0]
    : startHour !== undefined &&
        endHour !== undefined &&
        !isNaN(startHour) &&
        !isNaN(endHour)
      ? Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
      : [];

  const participantList =
    participantTab === 'completed'
      ? vote.completedVoterNameList
      : vote.uncompletedVoterNameList;

  const maxParticipantCount = Math.max(
    1,
    ...voteSlots.map((slot) => slot.participantCount)
  );

  const getSlot = (date: string, hour: number | string) => {
    return voteSlots.find((slot) =>
      vote.isAllDay
        ? slot.date === date
        : slot.date === date && Number(slot.startAt.slice(0, 2)) === hour
    );
  };

  const getSlotColor = (participantCount: number) => {
    const ratio = participantCount / maxParticipantCount;

    if (ratio >= 0.8) return 'bg-[#729BEF]';
    if (ratio >= 0.5) return 'bg-[#BBD2FF]';
    if (ratio > 0) return 'bg-[#DCE8FF]';

    return 'bg-[#F1F4F8]';
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {/* 헤더 */}
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: categoryColorMap[team.category] }}
          >
            <button onClick={() => router.back()} className="text-[#2C2C2C]">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
              {categoryMap[team.category]}
            </span>
          </div>

          {/* 바디 */}
          <div className="flex-1 overflow-y-auto">
            {isVoting ? (
              <div className="py-6 pr-12 pl-8 sm:py-8 sm:pr-14 sm:pl-10">
                <button
                  onClick={() => setIsVoting(false)}
                  className="mb-4 -ml-1 flex items-center gap-1 text-sm font-bold text-[#989898]"
                >
                  <ChevronLeft size={17} strokeWidth={2.5} />
                  뒤로가기
                </button>
                <div className="pb-3">
                  <h3 className="mt-[12px] text-[24px] font-bold text-[#2C2C2C]">
                    {vote.title}
                  </h3>
                  <p className="mt-1 text-[18px] font-semibold text-[#989898]">
                    가능한 날짜와 시간대를 선택해주세요
                  </p>
                </div>

                <VoteForm
                  voteId={voteId}
                  voteDates={voteDates}
                  voteHours={voteHours}
                  isAllDay={vote.isAllDay}
                  isOpened={vote.isOpened}
                  onSubmit={() => setIsVoting(false)}
                />
              </div>
            ) : isSelectingResult ? (
              <VoteResult
                title={vote.title}
                voteDates={voteDates}
                voteHours={voteHours}
                voteSlots={voteSlots}
                isAllDay={vote.isAllDay}
                onBack={() => setIsSelectingResult(false)}
                onSubmit={(startAt, endAt) => {
                  console.log({
                    title: vote.title,
                    isAllDay: vote.isAllDay,
                    selected_start_at: startAt,
                    selected_end_at: endAt,
                  });

                  // API 호출
                }}
              />
            ) : (
              <>
                <section className="border-b-[0.5px] border-[#D6DDE5] py-5 pr-12 pl-8 sm:py-8 sm:pr-14 sm:pl-10">
                  <p className="text-sm font-bold text-[#989898]">일정 정보</p>

                  <h1 className="mt-[12px] text-[27px] font-bold text-[#2C2C2C]">
                    {vote.title}
                  </h1>

                  <p className="mt-[6px] text-base leading-6 text-[#5C5C5C]">
                    {vote.description}
                  </p>

                  <p className="mt-6 text-xs text-[#B0B0B0]">
                    {vote.createdDate}
                  </p>
                </section>

                <section className="py-5 pr-12 pl-8 sm:py-8 sm:pr-14 sm:pl-10">
                  {isParticipantListOpen ? (
                    <>
                      <button
                        onClick={() => setIsParticipantListOpen(false)}
                        className="mb-6 flex cursor-pointer items-center gap-1 text-sm font-bold text-[#989898]"
                      >
                        <ChevronLeft size={17} strokeWidth={2.5} />
                        뒤로가기
                      </button>

                      <div className="border-b-[0.5px] border-[#D6DDE5]">
                        <div className="flex">
                          <button
                            onClick={() => setParticipantTab('completed')}
                            className={`px-5 pb-3 text-lg font-bold ${
                              participantTab === 'completed'
                                ? 'border-b-2 border-[#5E92F0] text-[#5E92F0]'
                                : 'text-[#D6DDE5]'
                            }`}
                          >
                            참여자
                          </button>

                          <button
                            onClick={() => setParticipantTab('uncompleted')}
                            className={`px-5 pb-3 text-lg font-bold ${
                              participantTab === 'uncompleted'
                                ? 'border-b-2 border-[#5E92F0] text-[#5E92F0]'
                                : 'text-[#D6DDE5]'
                            }`}
                          >
                            미참여자
                          </button>
                        </div>
                      </div>

                      <div className="mt-6">
                        {participantList.length === 0 ? (
                          <div className="flex h-20 items-center justify-center">
                            <p className="text-sm font-medium text-[#989898]">
                              {participantTab === 'completed'
                                ? '아직 투표에 참여한 사람이 없어요'
                                : '모든 팀원이 투표에 참여했어요'}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                            {participantList.map((name) => (
                              <div key={name} className="flex justify-between">
                                <span className="text-sm font-semibold">
                                  {name}
                                </span>
                                <span className="text-sm text-[#989898]">
                                  학과가들어가야하는뎅..
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-[#989898]">
                        참여 현황
                      </p>

                      <div className="mt-5 overflow-x-auto">
                        <div className="min-w-[450px]">
                          <div
                            className="grid gap-1 text-center text-xs font-semibold text-[#5C5C5C]"
                            style={{
                              gridTemplateColumns: `34px repeat(${voteDates.length}, minmax(64px, 1fr))`,
                            }}
                          >
                            <div />
                            {voteDates.map((date) => (
                              <div key={date}>
                                {Number(date.slice(5, 7))}월{' '}
                                {Number(date.slice(8, 10))}일
                              </div>
                            ))}
                          </div>

                          <div
                            className="mt-2 grid gap-1"
                            style={{
                              gridTemplateColumns: `34px repeat(${voteDates.length}, minmax(64px, 1fr))`,
                            }}
                          >
                            <div className="flex flex-col gap-1">
                              {voteHours.map((hour) => (
                                <div
                                  key={hour}
                                  className={`flex items-center justify-end pr-1 text-xs text-[#B0B0B0] ${
                                    vote.isAllDay ? 'h-16' : 'h-5'
                                  }`}
                                >
                                  {vote.isAllDay ? '종일' : hour}
                                </div>
                              ))}
                            </div>

                            {/* 슬롯 */}
                            {voteDates.map((date) => (
                              <div key={date} className="flex flex-col gap-1">
                                {voteHours.map((hour) => {
                                  const slot = getSlot(date, hour);

                                  return (
                                    <button
                                      key={`${date}-${hour}`}
                                      disabled={!slot || !vote.isOpened}
                                      className={`rounded-md transition-all duration-200 ${
                                        vote.isAllDay ? 'h-16' : 'h-5'
                                      } ${
                                        slot
                                          ? getSlotColor(slot.participantCount)
                                          : 'bg-[#F1F4F8]'
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </section>

                {!isParticipantListOpen && (
                  <>
                    <div className="mb-4 flex pr-13 pl-8">
                      <button
                        onClick={() => setIsParticipantListOpen(true)}
                        className="ml-auto flex cursor-pointer items-center gap-1 rounded-full border-[0.5] border-[#D6DDE5] bg-[#EEF1F5] py-1 pr-2 pl-4 text-sm font-bold text-[#2c2c2c]/60 transition hover:text-[#5c5c5c]"
                      >
                        참여자 목록보기
                        <ChevronRight size={20} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="mb-16 flex flex-col items-center gap-3">
                      <button
                        onClick={() => vote.isOpened && setIsVoting(true)}
                        disabled={!vote.isOpened}
                        className={`rounded-xl px-8 py-2 font-semibold transition-all ${
                          vote.isOpened
                            ? 'cursor-pointer bg-[#5E92F0] text-white active:scale-95'
                            : 'cursor-not-allowed bg-[#EEF1F5] text-[#989898]'
                        }`}
                      >
                        {vote.isOpened ? '투표하기' : '투표 마감'}
                      </button>

                      {/* 관리자만 */}
                      {true && (
                        <button
                          onClick={() => setIsSelectingResult(true)}
                          className="cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#EEF1F5] px-4 py-2 font-semibold text-[#5E92F0]"
                        >
                          일정 확정하기
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
