'use client';

import CalendarAddModal from '@/components/calendar/CalendarAddModal';
import type { CreateEventRequest } from '@/components/calendar/CalendarAddModal';
import CalendarEditModal from '@/components/calendar/CalendarEditModal';
import VoteAddModal, {
  type EventVoteCreateRequest,
} from '@/components/vote/VoteAddModar';
import Card from '@/components/main/Card';
import { useCreateVote } from '@/hooks/useVoteQuery';
import { formatDate } from '@/utils/date/formatDate';
import { getTeamRoleLabel } from '@/utils/teamRole';
import type { Schedule, RecurrenceEditScope } from '@/types/event';
import { formatDateKey, isScheduleOnDate } from '@/utils/date/calendar';
import { useCalendarGrid } from '@/hooks/calendar/useCalendarGrid';
import { useCalendarWeeks } from '@/hooks/calendar/useCalendarWeeks';
import { useTeamMonthSchedules } from '@/hooks/team/useTeamMonthSchedules';
import { categoryMap, categoryColorMap } from '@/constants/category';
import { useCreateInvitation } from '@/hooks/team/useTeamInvitationQuery';
import {
  useCreateTeamEvent,
  useUpdateTeamEvent,
  useDeleteTeamEvent,
} from '@/hooks/calendar/useEventQuery';
import { useTeamDetail, useTeamMembers } from '@/hooks/team/useTeamQuery';
import { useTeamVotes } from '@/hooks/useVoteQuery';
import { getDday } from '@/utils/date/getDday';
import { useTeamNotices } from '@/hooks/useNoticeQuery';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  Users,
} from 'lucide-react';
import TeamMemberDrawer from '@/components/team/TeamMemberDrawer';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScheduleListItem from '@/components/calendar/ScheduleListItem';
import MonthGridWithEvents from '@/components/calendar/MonthGridWithEvents';
import { TeamDetailSkeleton } from '@/components/skeleton';

const days = ['일', '월', '화', '수', '목', '금', '토'];

export default function TeamDetail() {
  const router = useRouter();
  const params = useParams();
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const teamId = Number(params.id);
  const { data: team, isLoading: isTeamLoading } = useTeamDetail(teamId);
  const { data: teamMembers = [] } = useTeamMembers(teamId);
  const { data: teamNoticesAll = [] } = useTeamNotices(teamId);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const { mutateAsync: createEvent } = useCreateTeamEvent(teamId);
  const { mutateAsync: updateEvent } = useUpdateTeamEvent(teamId);
  const { mutateAsync: deleteEvent } = useDeleteTeamEvent(teamId);
  const { mutateAsync: createVote } = useCreateVote(teamId);
  const { mutateAsync: createInvitation, isPending: isInviting } =
    useCreateInvitation(teamId);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isAddSelectOpen, setIsAddSelectOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isVoteAddOpen, setIsVoteAddOpen] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const { data: allVotes = [] } = useTeamVotes(teamId);
  const schedules = useTeamMonthSchedules(teamId, year, month);
  const calendarDates = useCalendarGrid(year, month);
  const weeks = useCalendarWeeks(calendarDates);
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMd(window.innerWidth >= 768);
    };

    checkScreen();

    window.addEventListener('resize', checkScreen);

    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (isMemberDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMemberDrawerOpen]);

  if (isTeamLoading) return <TeamDetailSkeleton />;

  if (!team) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">존재하지 않는 팀입니다.</p>
      </main>
    );
  }

  const selectedDateKey = formatDateKey(selectedDate);

  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );

  const dayLabel = days[selectedDate.getDay()];
  const isAdmin = team.role === 'LEADER' || team.role === 'MANAGER';

  const displayCount = isMd ? 4 : 3;

  const teamVotes = allVotes.slice(0, displayCount);

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    setSelectedDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    setSelectedDate(next);
  };

  const handleInvite = async (studentNumber: string) => {
    try {
      await createInvitation({ studentNumber });
    } catch (err) {
      console.error('초대 요청 실패', err);
      throw err; // 아래 드로어에서 성공/실패 구분하려면 던져주는 게 편함
    }
  };

  const handleToggleSchedule = async (target: Schedule) => {
    try {
      await updateEvent({
        eventId: target.eventId,
        body: {
          title: target.title,
          description: target.description,
          startAt: target.startAt,
          endAt: target.endAt,
          isAllDay: target.isAllDay,
          color: target.color,
          isFinished: !target.isFinished,
          occurrenceAt: target.occurrenceAt ?? target.startAt,
          recurrenceEditScope: 'THIS_INSTANCE',
          participants: [],
          ...(target.recurrence && { recurrence: target.recurrence }),
        },
      });
    } catch (err) {
      console.error('일정 완료 토글 실패', err);
    }
  };

  const handleAddSchedule = async (request: CreateEventRequest) => {
    try {
      await createEvent({
        title: request.title,
        description: request.description,
        startAt: request.startAt,
        endAt: request.endAt,
        isAllDay: request.isAllDay,
        color: request.color,
        participants: [],
        ...(request.recurrence && { recurrence: request.recurrence }),
      });
    } catch (err) {
      console.error('일정 생성 실패', err);
    }
  };

  const handleEditSchedule = async (
    updated: Schedule,
    scope: RecurrenceEditScope
  ) => {
    try {
      await updateEvent({
        eventId: updated.eventId,
        body: {
          title: updated.title,
          description: updated.description,
          startAt: updated.startAt,
          endAt: updated.endAt,
          isAllDay: updated.isAllDay,
          color: updated.color,
          isFinished: updated.isFinished,
          occurrenceAt: updated.occurrenceAt ?? updated.startAt,
          recurrenceEditScope: scope,
          participants: [],
          ...(updated.recurrence && { recurrence: updated.recurrence }),
        },
      });
    } catch (err) {
      console.error('일정 수정 실패', err);
    }
    setEditSchedule(null);
  };

  const handleDeleteSchedule = async (
    eventId: number,
    scope: RecurrenceEditScope
  ) => {
    try {
      await deleteEvent({
        eventId,
        scope,
        occurrence: editSchedule?.occurrenceAt ?? '',
      });
    } catch (err) {
      console.error('일정 삭제 실패', err);
    }
    setEditSchedule(null);
  };

  const handleCreateVote = async (request: EventVoteCreateRequest) => {
    try {
      await createVote(request);
    } catch (err) {
      console.error('투표 생성 실패', err);
    }
    setIsVoteAddOpen(false);
  };

  const teamNotices = teamNoticesAll.slice(0, displayCount);

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: categoryColorMap[team.category] }}
          >
            <button
              onClick={() => router.push('/team')}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} className="h-7 w-7" />
            </button>

            <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
              {categoryMap[team.category]}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex items-start justify-between">
                <div className="relative h-[150px] w-[150px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]">
                  {team.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={team.imageUrl}
                      alt={team.name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  )}

                  {/* 수정 버튼 */}
                  {isAdmin && (
                    <button
                      onClick={() => router.push(`/team/${teamId}/edit`)}
                      className="absolute top-2 right-2 rounded-full bg-[#989898]/60 px-3 py-1 text-[11px] text-white backdrop-blur hover:bg-[#989898]/70 active:scale-95"
                    >
                      수정
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMemberDrawerOpen(true)}
                  className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-full border-[0.5px] border-[#D6DDE5] bg-[#F8F9FB] transition-all duration-150 active:scale-95 sm:hidden"
                >
                  <Menu size={18} className="text-[#2C2C2C]" />
                </button>
              </div>

              <div className="flex flex-col justify-center px-1 sm:px-0">
                <h1 className="text-3xl font-bold text-[#2C2C2C]">
                  {team.name}
                </h1>

                <div className="mt-2 h-[38px] sm:w-[300px] md:w-[400px]">
                  <p
                    className="text-sm text-[#989898]"
                    style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {team.description}
                  </p>
                </div>
                <p className="mt-3 text-sm text-[#989898]">
                  링크 :
                  {team.link ? (
                    <a
                      href={team.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-block max-w-[210px] truncate align-bottom text-[#5E92F0] underline"
                    >
                      {team.link}
                    </a>
                  ) : (
                    ' -'
                  )}
                </p>

                <p className="mt-1 text-sm text-[#989898]">
                  SNS :
                  {team.sns ? (
                    <a
                      href={team.sns}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-block max-w-[210px] truncate align-bottom text-[#5E92F0] underline"
                    >
                      {team.sns}
                    </a>
                  ) : (
                    ' -'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMemberDrawerOpen(true)}
                className="ml-auto hidden h-10 w-10 shrink-0 items-center justify-center self-start rounded-full border-[0.5px] border-[#D6DDE5] bg-[#F8F9FB] transition-all duration-150 active:scale-95 sm:flex"
              >
                <Menu size={18} className="text-[#2C2C2C]" />
              </button>
            </section>

            <section className="mt-4 flex max-h-[535px] flex-col rounded-2xl bg-[#F8F9FB] py-2 md:mt-6">
              <div className="mx-4 flex items-center justify-between border-b-[0.5] border-[#D6DDE5] pb-2">
                <h2 className="px-2 pt-3 text-2xl font-bold text-[#2C2C2C]">
                  {month + 1}월
                </h2>

                <div className="flex items-center gap-4 pt-2">
                  {isAdmin && (
                    <button
                      onClick={() => setIsAddSelectOpen(true)}
                      className="flex items-center gap-1 text-xs text-[#989898] active:scale-95"
                    >
                      <Plus size={13} />
                      일정 생성
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4] text-[#2c2c2c]/40 transition-all duration-150 active:scale-90"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      onClick={handleNextMonth}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4] text-[#2c2c2c]/40 transition-all duration-150 active:scale-90"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 pr-2.5 pl-2 text-center text-xs text-[#DEDEDE]">
                {days.map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div
                className="thin-scrollbar min-h-0 flex-1 overflow-y-auto"
                style={{ scrollbarGutter: 'stable' }}
              >
                <MonthGridWithEvents
                  year={year}
                  month={month}
                  weeks={weeks}
                  schedules={schedules}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setIsMobileDetailOpen(true);
                  }}
                  rowMinHeight={86}
                  selectedCellClassName="rounded-xl bg-white"
                  cellTextSize="text-[13px]"
                  otherCircleSize="h-6 w-6"
                />
              </div>
            </section>
            <section className="gap-6 md:flex md:grid md:grid-cols-10">
              <div className="col-span-5 mt-4 h-[300px] rounded-2xl bg-[#F8F9FB] px-6 md:mt-6 md:h-[400px]">
                <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pt-6 pb-2 text-xl font-bold text-[#2c2c2c]">
                  <h1 className="text-xl font-bold">투표</h1>

                  <button
                    className="cursor-pointer"
                    onClick={() => router.push(`/team/${teamId}/vote`)}
                  >
                    <ChevronRight />
                  </button>
                </div>

                <div className="flex flex-col">
                  {teamVotes.map((vote) => (
                    <button
                      key={vote.voteId}
                      onClick={() =>
                        router.push(`/team/${teamId}/vote/${vote.voteId}`)
                      }
                      className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] py-3.5 text-left transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-[16px] font-semibold text-[#2C2C2C] md:text-[17px]">
                            {vote.title}
                          </h2>

                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              vote.isOpened
                                ? 'bg-[#E8F1FF] text-[#5E92F0]'
                                : 'bg-[#EEF1F5] text-[#989898]'
                            }`}
                          >
                            {vote.isOpened ? '진행중' : '마감'}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-1 text-xs text-[#989898] md:text-sm">
                          {vote.description || '-'}
                        </p>
                      </div>

                      <p className="ml-4 shrink-0 text-xs text-[#989898] md:hidden">
                        {formatDate(vote.createdDate)}
                      </p>
                    </button>
                  ))}

                  {teamVotes.length === 0 && (
                    <div className="flex h-[100px] items-center justify-center text-sm text-[#989898]">
                      아직 등록된 투표가 없어요
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-5 mt-4 h-[300px] rounded-2xl bg-[#F8F9FB] px-6 md:mt-6 md:h-[400px]">
                <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pt-6 pb-2 text-xl font-bold text-[#2c2c2c]">
                  <h1 className="text-xl font-bold">공지사항</h1>

                  <button
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/team/${teamId}/notice?from=team`)
                    }
                  >
                    <ChevronRight />
                  </button>
                </div>

                <div className="flex flex-col">
                  {teamNotices.map((notice) => (
                    <button
                      key={notice.noticeId}
                      onClick={() =>
                        router.push(`/team/${teamId}/notice/${notice.noticeId}`)
                      }
                      className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] py-3.5 text-left transition"
                    >
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[16px] font-semibold text-[#2C2C2C] md:text-[17px]">
                          {notice.title}
                        </h2>
                        <div className="flex items-center justify-between">
                          <p className="mt-1 line-clamp-1 text-xs text-[#989898] md:text-sm">
                            {notice.authorName} •{' '}
                            {getTeamRoleLabel(notice.teamRole)}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-[#989898] md:text-sm">
                            {formatDate(notice.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {teamNotices.length === 0 && (
                    <div className="flex h-[100px] items-center justify-center text-sm text-[#989898]">
                      아직 등록된 공지사항이 없어요
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </Card>
      </section>

      {isAddSelectOpen && (
        <div
          onClick={() => setIsAddSelectOpen(false)}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/20 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[440px] rounded-3xl bg-white px-6 py-6 sm:w-[500px]"
          >
            <h2 className="mb-4 text-xl font-bold text-[#2C2C2C]">
              어떻게 일정을 추가할까요?
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddSelectOpen(false);
                  setIsAddOpen(true);
                }}
                className="flex h-[100px] flex-col items-center justify-center rounded-2xl bg-[#F8F9FB] transition-all duration-150 active:scale-95 sm:h-[120px]"
              >
                <Plus
                  size={24}
                  strokeWidth={2.5}
                  className="mb-2 rounded-full bg-[#EEF1F5] p-1 text-[#5E92F0]"
                />
                <p className="text-base font-bold text-[#2C2C2C] sm:text-[18px]">
                  기본 일정 추가
                </p>
                <p className="mt-1 text-[11px] text-[#989898] sm:text-[13px]">
                  일정을 바로 생성할 수 있어요
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddSelectOpen(false);
                  setIsVoteAddOpen(true);
                }}
                className="flex h-[100px] flex-col items-center justify-center rounded-2xl bg-[#F8F9FB] transition-all duration-150 active:scale-95 sm:h-[120px]"
              >
                <Check
                  size={24}
                  strokeWidth={2.5}
                  className="mb-2 rounded-full bg-[#EEF1F5] p-1 text-[#5E92F0]"
                />
                <p className="text-base font-bold text-[#2C2C2C] sm:text-[18px]">
                  일정 투표 생성
                </p>
                <p className="mt-1 text-[11px] text-[#989898] sm:text-[13px]">
                  일정을 투표 후 생성할 수 있어요
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobileDetailOpen && (
        <div
          onClick={() => setIsMobileDetailOpen(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 px-5"
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop flex h-[70vh] w-full max-w-[365px] flex-col rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white px-6 py-6"
          >
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <h2 className="text-[24px] font-bold text-[#2C2C2C]">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 (
                {dayLabel})
              </h2>

              <div className="text-xs text-[#C8D0D9]">
                {getDday(selectedDate)}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {selectedSchedules.map((schedule) => (
                <ScheduleListItem
                  key={`${schedule.eventId}-${schedule.occurrenceAt ?? schedule.startAt}`}
                  schedule={schedule}
                  showToggle={isAdmin}
                  onClickItem={(s) => {
                    if (!isAdmin) return;
                    setEditSchedule(s);
                  }}
                  onToggle={handleToggleSchedule}
                />
              ))}
            </div>
          </aside>
        </div>
      )}

      {isAdmin && (
        <CalendarAddModal
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddSchedule}
          selectedDate={selectedDate}
        />
      )}

      {isAdmin && (
        <CalendarEditModal
          key={`${editSchedule?.eventId}-${editSchedule?.occurrenceAt ?? ''}`}
          open={editSchedule !== null}
          schedule={editSchedule}
          onClose={() => setEditSchedule(null)}
          onEdit={handleEditSchedule}
          onDelete={handleDeleteSchedule}
        />
      )}

      {isAdmin && (
        <VoteAddModal
          open={isVoteAddOpen}
          onClose={() => setIsVoteAddOpen(false)}
          onCreate={handleCreateVote}
          members={teamMembers}
        />
      )}
      <TeamMemberDrawer
        open={isMemberDrawerOpen}
        onClose={() => setIsMemberDrawerOpen(false)}
        teamId={teamId}
        teamMembers={teamMembers}
        isAdmin={isAdmin}
        onInvite={handleInvite}
        isInviting={isInviting}
      />
    </main>
  );
}
