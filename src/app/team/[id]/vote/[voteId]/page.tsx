'use client';

import Card from '@/components/main/Card';
import { teamDetails } from '@/mocks/teams';
import { eventVoteTimeSlots, votes } from '@/mocks/votes';
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

  const voteDates = Array.from(new Set(voteSlots.map((slot) => slot.date)));

  const voteHours = Array.from(
    new Set(voteSlots.map((slot) => Number(slot.startAt.slice(0, 2))))
  ).sort((a, b) => a - b);

  const maxParticipantCount = Math.max(
    1,
    ...voteSlots.map((slot) => slot.participantCount)
  );

  const participantList =
    participantTab === 'completed'
      ? vote.completedVoterNameList
      : vote.uncompletedVoterNameList;

  const getSlot = (date: string, hour: number) => {
    return voteSlots.find(
      (slot) => slot.date === date && Number(slot.startAt.slice(0, 2)) === hour
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
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-3xl flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: categoryColorMap[team.category] }}
          >
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

            <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
              {categoryMap[team.category]}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <section className="border-b-[0.5px] border-[#D6DDE5] py-5 pr-12 pl-8 sm:py-8 sm:pr-14 sm:pl-10">
              <p className="text-sm font-bold text-[#989898]">일정 정보</p>

              <h1 className="mt-2 text-2xl font-bold text-[#2C2C2C]">
                {vote.title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#5C5C5C]">
                {vote.description}
              </p>

              <p className="mt-6 text-xs text-[#B0B0B0]">{vote.date}</p>
            </section>

            <section
              className={`px-6 py-5 sm:px-8 sm:py-8 ${
                isParticipantListOpen ? '' : 'pr-12 sm:pr-14'
              }`}
            >
              {isParticipantListOpen ? (
                <>
                  <button
                    onClick={() => setIsParticipantListOpen(false)}
                    className="mb-6 flex cursor-pointer items-center gap-1 text-sm font-bold text-[#989898]"
                  >
                    <ChevronLeft size={17} />
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

                  <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-5 px-2 sm:grid-cols-3">
                    {participantList.map((name) => (
                      <div key={name} className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-[#2C2C2C]">
                          {name}
                        </span>

                        <span className="text-sm text-[#989898]">
                          컴퓨터공학부
                        </span>
                      </div>
                    ))}

                    {participantList.length === 0 && (
                      <p className="col-span-full text-sm text-[#989898]">
                        표시할 참여자가 없습니다.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-bold text-[#989898]">
                    참여 현황
                  </h2>

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
                              className="flex h-5 items-center justify-end pr-1 text-xs text-[#B0B0B0]"
                            >
                              {hour}
                            </div>
                          ))}
                        </div>

                        {voteDates.map((date) => (
                          <div key={date} className="flex flex-col gap-1">
                            {voteHours.map((hour) => {
                              const slot = getSlot(date, hour);

                              return (
                                <button
                                  key={`${date}-${hour}`}
                                  disabled={!slot || !vote.isOpened}
                                  className={`h-5 rounded-md transition-all duration-200 ease-in-out ${
                                    slot
                                      ? getSlotColor(slot.participantCount)
                                      : 'bg-[#F1F4F8]'
                                  } ${
                                    vote.isOpened && slot
                                      ? 'cursor-pointer active:scale-95'
                                      : ''
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
                <div className="flex py-5 pr-12 pl-8 sm:pr-14 sm:pl-10">
                  <button
                    onClick={() => setIsParticipantListOpen(true)}
                    className="ml-auto flex cursor-pointer items-center gap-2 text-[#989898]"
                  >
                    <h3 className="text-sm font-semibold">참여자 목록보기</h3>
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="mb-12 flex py-8">
                  <button className="mx-auto rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-5 py-2 text-white transition-all duration-200 ease-in-out active:scale-95">
                    투표하기
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
