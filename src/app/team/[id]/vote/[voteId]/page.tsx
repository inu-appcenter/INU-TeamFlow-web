'use client';

import Card from '@/components/main/Card';
import { categoryMap, categoryColorMap } from '@/constants/category';
import { useTeamDetail } from '@/hooks/team/useTeamQuery';
import {
  useVoteDetail,
  useVoteSlots,
  useSelectVoteSlots,
  useConfirmVoteResult,
  useDeleteVote,
} from '@/hooks/useVoteQuery';
import VoteForm from '@/components/vote/VoteForm';
import VoteResult from '@/components/vote/VoteResult';
import { ChevronLeft, ChevronRight, EllipsisVertical } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getDepartmentName } from '@/utils/getDepartmentName';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const tabRefs = useRef<{
    completed: HTMLButtonElement | null;
    uncompleted: HTMLButtonElement | null;
  }>({ completed: null, uncompleted: null });
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[participantTab];
    if (el) {
      setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [participantTab, isParticipantListOpen]);
  const { data: team, isLoading: isTeamLoading } = useTeamDetail(teamId);
  const {
    data: vote,
    isLoading: isVoteLoading,
    refetch: refetchVote,
  } = useVoteDetail(voteId);
  const { data: voteSlots = [] } = useVoteSlots(voteId);
  const { mutateAsync: selectSlots } = useSelectVoteSlots(voteId);
  const { mutateAsync: confirmResult } = useConfirmVoteResult(voteId);
  const { mutate: deleteVoteMutate, isPending: isDeleting } =
    useDeleteVote(teamId);

  if (isTeamLoading || isVoteLoading) return null;

  if (!team || !vote) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">
          존재하지 않는 투표입니다.
        </p>
      </main>
    );
  }
  const isAdmin = team.role === 'LEADER' || team.role === 'MANAGER';

  const canAccess = vote.isVoter || vote.isCreator;

  if (!canAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">
          참여자만 조회할 수 있는 투표예요
        </p>
      </main>
    );
  }

  const voteDates = vote.dates ?? [];

  const startHour = Number(vote.dailyTimeStart?.slice(0, 2));
  const endHour = Number(vote.dailyTimeEnd?.slice(0, 2));

  const voteHours = vote.isAllDay
    ? [0]
    : startHour !== undefined &&
        endHour !== undefined &&
        !isNaN(startHour) &&
        !isNaN(endHour)
      ? Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
      : [];

  const participantList =
    participantTab === 'completed'
      ? (vote.completedVoterList ?? [])
      : (vote.uncompletedVoterList ?? []);

  const maxParticipantCount = Math.max(
    1,
    ...voteSlots.map((slot) => slot.participantCount)
  );

  const getSlotColor = (participantCount: number) => {
    const ratio = participantCount / maxParticipantCount;

    if (ratio >= 0.8) return 'bg-[#729BEF]/80';
    if (ratio >= 0.5) return 'bg-[#BBD2FF]/90';
    if (ratio > 0) return 'bg-[#DCE8FF]/80';

    return 'bg-[#F1F4F8]';
  };

  const handleDeleteVote = () => {
    if (isDeleting) return;
    deleteVoteMutate(voteId, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {/* 헤더 */}
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: categoryColorMap[team.category] }}
          >
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-4">
              <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
                {categoryMap[team.category]}
              </span>

              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="cursor-pointer pt-1 text-[#2C2C2C]"
                  >
                    <EllipsisVertical size={20} />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute top-8 right-[-10px] z-20 w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-1">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsDeleteConfirmOpen(true);
                          }}
                          disabled={isDeleting}
                          className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#EF4444] transition hover:bg-[#F6F8FA] disabled:opacity-50"
                        >
                          삭제하기
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 바디 */}
          <div className="flex-1 overflow-y-auto">
            {isVoting ? (
              <div className="py-6 pr-12 pl-8 sm:py-8 sm:pr-14 sm:pl-10">
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
                  voteSlots={voteSlots}
                  isAllDay={vote.isAllDay}
                  isOpened={vote.isOpened}
                  onSubmit={async (selectedSlotIds) => {
                    try {
                      await selectSlots({ slotIdList: selectedSlotIds });
                      setIsVoting(false);
                    } catch (err) {
                      console.error('투표 실패', err);
                    }
                  }}
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
                onSubmit={async (startAt, endAt) => {
                  try {
                    await confirmResult({
                      title: vote.title,
                      isAllDay: vote.isAllDay,
                      selectedStartAt:
                        startAt.length === 16 ? `${startAt}:00` : startAt,
                      selectedEndAt:
                        endAt.length === 16 ? `${endAt}:00` : endAt,
                    });
                    setIsSelectingResult(false);
                  } catch (err) {
                    console.error('일정 확정 실패', err);
                  }
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

                      <div className="relative border-b-[0.5px] border-[#D6DDE5]">
                        <div className="flex">
                          <button
                            ref={(el) => {
                              tabRefs.current.completed = el;
                            }}
                            onClick={() => setParticipantTab('completed')}
                            className={`px-5 pb-3 text-lg font-bold transition-colors ${
                              participantTab === 'completed'
                                ? 'text-[#5E92F0]'
                                : 'text-[#D6DDE5]'
                            }`}
                          >
                            참여자
                          </button>

                          <button
                            ref={(el) => {
                              tabRefs.current.uncompleted = el;
                            }}
                            onClick={() => setParticipantTab('uncompleted')}
                            className={`px-5 pb-3 text-lg font-bold transition-colors ${
                              participantTab === 'uncompleted'
                                ? 'text-[#5E92F0]'
                                : 'text-[#D6DDE5]'
                            }`}
                          >
                            미참여자
                          </button>
                        </div>

                        <div
                          className="absolute bottom-0 h-[2px] bg-[#5E92F0] transition-all duration-300 ease-in-out"
                          style={{
                            left: tabIndicator.left,
                            width: tabIndicator.width,
                          }}
                        />
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
                            {participantList.map((voter) => (
                              <div
                                key={voter.name}
                                className="flex justify-between"
                              >
                                <span className="text-sm font-semibold">
                                  {voter.name}
                                </span>
                                <span className="text-sm text-[#989898]">
                                  {getDepartmentName(voter.department)}
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
                                  className={`flex items-start justify-end pt-[1px] pr-1 text-xs text-[#B0B0B0] ${
                                    vote.isAllDay ? 'h-16' : 'h-[44px]'
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
                                  const slots = vote.isAllDay
                                    ? ['00']
                                    : ['00', '30'];

                                  return slots.map((minute) => {
                                    const slot = voteSlots.find(
                                      (s) =>
                                        s.date === date &&
                                        Number(s.startAt.slice(0, 2)) ===
                                          hour &&
                                        s.startAt.slice(3, 5) === minute
                                    );

                                    return (
                                      <button
                                        key={`${date}-${hour}-${minute}`}
                                        disabled={!slot || !vote.isOpened}
                                        className={`rounded-md transition-all duration-200 ${
                                          vote.isAllDay ? 'h-16' : 'h-5'
                                        } ${
                                          slot
                                            ? getSlotColor(
                                                slot.participantCount
                                              )
                                            : 'bg-[#F1F4F8]'
                                        }`}
                                      />
                                    );
                                  });
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
                        onClick={() => {
                          setIsParticipantListOpen(true);
                          refetchVote();
                        }}
                        className="ml-auto flex cursor-pointer items-center gap-1 rounded-full border-[0.5] border-[#D6DDE5]/40 bg-[#EEF1F5] py-1 pr-2 pl-4 text-sm font-bold text-[#2c2c2c]/60 transition hover:text-[#5c5c5c]"
                      >
                        참여자 목록보기
                        <ChevronRight size={20} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="mb-20 flex flex-col items-center gap-3">
                      <button
                        onClick={() =>
                          vote.isOpened && vote.isVoter && setIsVoting(true)
                        }
                        disabled={!vote.isOpened || !vote.isVoter}
                        className={`h-10 w-30 rounded-xl font-medium transition-all ${
                          vote.isOpened && vote.isVoter
                            ? 'cursor-pointer bg-[#5E92F0] text-white active:scale-95'
                            : 'cursor-not-allowed bg-[#EEF1F5] text-[#989898]'
                        }`}
                      >
                        {vote.isOpened
                          ? vote.isVoter
                            ? '투표하기'
                            : '투표 미대상'
                          : '투표 마감'}
                      </button>

                      {/* 관리자만 */}
                      {isAdmin && (
                        <button
                          onClick={() =>
                            !vote.isOpened ? null : setIsSelectingResult(true)
                          }
                          disabled={!vote.isOpened}
                          className={`rounded-xl text-center font-semibold transition-all ${
                            vote.isOpened
                              ? 'h-10 w-30 cursor-pointer border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] py-2 pl-0.5 text-[15px] text-[#5E92F0] active:scale-95'
                              : 'h-10 w-30 cursor-not-allowed bg-[#EEF1F5] text-[#989898]'
                          }`}
                        >
                          {vote.isOpened ? '일정 확정하기' : '확정 완료'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
        {isDeleteConfirmOpen && (
          <div
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-modal-pop w-[360px] rounded-3xl bg-white p-4 shadow-xl"
            >
              <h2 className="text-center text-xl font-bold text-[#2C2C2C]">
                투표를 삭제할까요?
              </h2>

              <p className="mt-2 text-center text-[15px] text-[#989898]">
                삭제한 투표는 복구할 수 없어요
              </p>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
                >
                  취소
                </button>

                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    handleDeleteVote();
                  }}
                  className="flex-1 cursor-pointer rounded-xl bg-[#EF4444] py-3 font-semibold text-white transition-all duration-200 active:scale-95"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
