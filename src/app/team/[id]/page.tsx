'use client';

import CalendarAddModal from '@/components/calendar/CalendarAddModal';
import type { CreateEventRequest } from '@/components/calendar/CalendarAddModal';
import CalendarEditModal from '@/components/calendar/CalendarEditModal';
import VoteAddModal, {
  type EventVoteCreateRequest,
} from '@/components/vote/VoteAddModar';
import type { Schedule, RecurrenceEditScope } from '@/types/event';

import Card from '@/components/main/Card';
import { useCreateVote } from '@/hooks/useVoteQuery';
import { formatDate } from '@/utils/date/formatDate';
import { getTeamRoleLabel } from '@/utils/teamRole';

import {
  useTeamEvents,
  useCreateTeamEvent,
  useUpdateTeamEvent,
  useDeleteTeamEvent,
} from '@/hooks/useEventQuery';
import { useTeamDetail, useTeamMembers } from '@/hooks/useTeamQuery';
import { useTeamVotes } from '@/hooks/useVoteQuery';

import { EVENT_COLOR_MAP } from '@/constants/scheduleColor';
import { getDday } from '@/utils/date/getDday';

import { useTeamNotices } from '@/hooks/useNoticeQuery';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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

const users = [
  { studentNumber: '202312345', name: '홍길동' },
  { studentNumber: '202212312', name: '김철수' },
  { studentNumber: '202312145', name: '홍길동1' },
  { studentNumber: '202212512', name: '김철수2' },
];

const days = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarDate = {
  date: number;
  type: 'prev' | 'current' | 'next';
};

type SlottedSchedule = Schedule & { slot: number };

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

const formatTime = (dateString: string) => {
  return dateString.slice(11, 16);
};

const darkenColor = (hex: string, amount: number) => {
  const color = hex.replace('#', '');

  const r = Math.max(0, parseInt(color.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(color.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(color.substring(4, 6), 16) - amount);

  return `rgb(${r}, ${g}, ${b})`;
};

const isScheduleOnDate = (schedule: Schedule, dateKey: string) => {
  if (!schedule.isSingle && schedule.occurrenceAt) {
    return schedule.occurrenceAt.slice(0, 10) === dateKey;
  }
  const startDate = schedule.startAt.slice(0, 10);
  const endDate = schedule.endAt.slice(0, 10);
  return dateKey >= startDate && dateKey <= endDate;
};

function assignWeekSlots(
  weekDateKeys: string[],
  schedules: Schedule[]
): Map<string, SlottedSchedule[]> {
  const seen = new Set<string>();
  const weekSchedules: Schedule[] = [];

  for (const dk of weekDateKeys) {
    for (const s of schedules) {
      const key = `${s.eventId}-${s.occurrenceAt ?? s.startAt}`;
      if (!seen.has(key) && isScheduleOnDate(s, dk)) {
        seen.add(key);
        weekSchedules.push(s);
      }
    }
  }

  const periodSchedules = weekSchedules.filter((s) => {
    const start = s.startAt.slice(0, 10);
    const end = s.endAt.slice(0, 10);

    return start !== end && s.isSingle;
  });

  const singleSchedules = weekSchedules.filter((s) => {
    const start = s.startAt.slice(0, 10);
    const end = s.endAt.slice(0, 10);

    return !(start !== end && s.isSingle);
  });

  const weekStart = weekDateKeys[0];
  const weekEnd = weekDateKeys[weekDateKeys.length - 1];

  const clampToWeek = (start: string, end: string) => ({
    cs: start < weekStart ? weekStart : start,
    ce: end > weekEnd ? weekEnd : end,
  });

  const slotMap: SlottedSchedule[] = [];
  const usedSlots: { cs: string; ce: string; slot: number }[] = [];

  for (const s of periodSchedules) {
    const { cs, ce } = clampToWeek(
      s.startAt.slice(0, 10),
      s.endAt.slice(0, 10)
    );

    let slot = 0;

    while (usedSlots.some((u) => u.slot === slot && cs <= u.ce && ce >= u.cs)) {
      slot++;
    }

    usedSlots.push({ cs, ce, slot });
    slotMap.push({ ...s, slot });
  }

  for (const s of singleSchedules) {
    slotMap.push({ ...s, slot: -1 });
  }

  const result = new Map<string, SlottedSchedule[]>();

  for (const dk of weekDateKeys) {
    const forDate = slotMap
      .filter((s) => isScheduleOnDate(s, dk))
      .sort((a, b) => {
        if (a.slot !== -1 && b.slot === -1) return -1;
        if (a.slot === -1 && b.slot !== -1) return 1;
        if (a.slot !== -1 && b.slot !== -1) return a.slot - b.slot;

        return a.startAt.localeCompare(b.startAt);
      });

    result.set(dk, forDate);
  }

  return result;
}

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

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const { mutateAsync: createEvent } = useCreateTeamEvent(teamId);
  const { mutateAsync: updateEvent } = useUpdateTeamEvent(teamId);
  const { mutateAsync: deleteEvent } = useDeleteTeamEvent(teamId);
  const { mutateAsync: createVote } = useCreateVote(teamId);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);

  const [selectedDate, setSelectedDate] = useState(today);
  const [isAddSelectOpen, setIsAddSelectOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isVoteAddOpen, setIsVoteAddOpen] = useState(false);

  const [isMd, setIsMd] = useState(false);

  const { data: allVotes = [] } = useTeamVotes(teamId);

  const { data: prevSchedules = [] } = useTeamEvents(
    teamId,
    month === 0 ? year - 1 : year,
    month === 0 ? 12 : month
  );
  const { data: currentSchedules = [] } = useTeamEvents(
    teamId,
    year,
    month + 1
  );
  const { data: nextSchedules = [] } = useTeamEvents(
    teamId,
    month === 11 ? year + 1 : year,
    month === 11 ? 1 : month + 2
  );

  const { data: teamNoticesAll = [] } = useTeamNotices(teamId);

  const schedules = Array.from(
    new Map(
      [...prevSchedules, ...currentSchedules, ...nextSchedules].map((s) => [
        `${s.eventId}-${s.occurrenceAt ?? s.startAt}`,
        s,
      ])
    ).values()
  );

  useEffect(() => {
    const checkScreen = () => {
      setIsMd(window.innerWidth >= 768);
    };

    checkScreen();

    window.addEventListener('resize', checkScreen);

    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  if (isTeamLoading) return null;

  if (!team) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">존재하지 않는 팀입니다.</p>
      </main>
    );
  }

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const prevMonthDates: CalendarDate[] = Array.from(
    { length: firstDay },
    (_, i) => ({
      date: prevLastDate - firstDay + i + 1,
      type: 'prev',
    })
  );

  const currentMonthDates: CalendarDate[] = Array.from(
    { length: lastDate },
    (_, i) => ({
      date: i + 1,
      type: 'current',
    })
  );

  const totalDateCount = prevMonthDates.length + currentMonthDates.length;
  const nextMonthCount = (7 - (totalDateCount % 7)) % 7;

  const nextMonthDates: CalendarDate[] = Array.from(
    { length: nextMonthCount },
    (_, i) => ({
      date: i + 1,
      type: 'next',
    })
  );

  const calendarDates = [
    ...prevMonthDates,
    ...currentMonthDates,
    ...nextMonthDates,
  ];

  const weeks = Array.from(
    { length: calendarDates.length / 7 },
    (_, weekIndex) => calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  const selectedDateKey = formatDateKey(selectedDate);

  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );

  const dayLabel = days[selectedDate.getDay()];
  const filteredUsers = users.filter((user) => user.name.includes(keyword));
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

  const handleInvite = (studentNumber: string) => {
    const request = {
      studentNumber,
    };

    console.log('초대 요청', request);

    setIsInviteOpen(false);
    setKeyword('');
  };

  const handleToggleSchedule = async (eventId: number) => {
    const target = schedules.find((s) => s.eventId === eventId);
    if (!target) return;

    try {
      await updateEvent({
        eventId,
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

  const DATE_HEADER_H = 28;
  const EVENT_H = 20;
  const EVENT_GAP = 4;

  const teamNotices = teamNoticesAll.slice(0, displayCount);

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: categoryColorMap[team.category] }}
          >
            <button
              onClick={() => router.push('/team')}
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

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <section className="grid grid-cols-[140px_1fr] gap-6 sm:grid-cols-[150px_1fr_200px] md:grid-cols-[150px_1fr_300px]">
              <div className="relative h-[140px] w-[140px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] sm:h-[150px] sm:w-[150px]">
                {team.imageUrl && (
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

              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-[#2C2C2C] sm:text-3xl">
                  {team.name}
                </h1>

                <div className="mt-2 h-[38px]">
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

              <div className="relative hidden flex-col gap-3 sm:block">
                <div className="h-[150px] w-[200px] rounded-2xl border-[0.8px] border-[#D6DDE5] bg-white pt-3 md:w-[300px]">
                  <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5]">
                    <div className="flex items-center gap-1.5 px-4 pb-2">
                      <Users size={15} />
                      <h2 className="text-xs font-bold text-[#2C2C2C] md:text-[13px]">
                        멤버 목록
                      </h2>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => setIsInviteOpen((prev) => !prev)}
                        className="cursor-pointer px-3 pb-2 text-[9px] text-[#989898] md:text-[12px]"
                      >
                        <span className="flex items-center gap-1">
                          <Plus size={10} />
                          초대하기
                        </span>
                      </button>
                    )}
                  </div>

                  <div
                    className="thin-scrollbar flex max-h-[105px] flex-wrap gap-1.5 overflow-y-auto px-2 pt-2"
                    style={{ scrollbarGutter: 'stable' }}
                  >
                    {teamMembers.map((member) => (
                      <span
                        key={member.teamMemberId}
                        className="rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[11px] text-[#6E7780] md:text-[12px]"
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>

                {isAdmin && isInviteOpen && (
                  <>
                    <div
                      onClick={() => setIsInviteOpen(false)}
                      className="fixed inset-0 z-40"
                    />

                    <div className="absolute top-[160px] left-0 z-50 max-h-[250px] w-[200px] rounded-2xl border-[0.8px] border-[#D6DDE5] bg-white py-3 md:w-[300px]">
                      <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-2 py-1.5">
                        <Search size={13} className="text-[#989898]" />

                        <input
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          placeholder="이름 검색"
                          className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#989898]"
                        />
                      </div>

                      <div className="thin-scrollbar flex max-h-[150px] flex-col overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.studentNumber}
                            className="flex items-center justify-between py-1 pr-2 pl-4 hover:bg-[#F6F8FA]"
                          >
                            <div>
                              <p className="truncate text-[13px] font-medium text-[#2C2C2C]">
                                {user.name}
                              </p>

                              <p className="text-[11px] text-[#989898]">
                                {user.studentNumber}
                              </p>
                            </div>

                            <button
                              onClick={() => handleInvite(user.studentNumber)}
                              className="cursor-pointer rounded-full bg-[#5E92F0] px-2.5 py-1 text-[10px] text-white"
                            >
                              추가
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
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
                <div
                  className="grid grid-cols-7 pl-2 text-center text-sm text-[#2C2C2C]"
                  style={{
                    gridTemplateRows: `repeat(${weeks.length}, minmax(86px, auto))`,
                  }}
                >
                  {weeks.map((week, weekIndex) => {
                    const weekDateKeys = week.map((item) => {
                      const cellDate =
                        item.type === 'prev'
                          ? new Date(year, month - 1, item.date)
                          : item.type === 'next'
                            ? new Date(year, month + 1, item.date)
                            : new Date(year, month, item.date);

                      return formatDateKey(cellDate);
                    });

                    const slottedByDate = assignWeekSlots(
                      weekDateKeys,
                      schedules
                    );

                    const maxSlot = Math.max(
                      0,
                      ...Array.from(slottedByDate.values()).flatMap((list) =>
                        list.map((s) => (s.slot === -1 ? 0 : s.slot + 1))
                      )
                    );

                    const maxSingle = Math.max(
                      0,
                      ...Array.from(slottedByDate.values()).map(
                        (list) => list.filter((s) => s.slot === -1).length
                      )
                    );

                    const cellMinH =
                      DATE_HEADER_H +
                      maxSlot * (EVENT_H + EVENT_GAP) +
                      maxSingle * (EVENT_H + EVENT_GAP) +
                      8;

                    return week.map((item, i) => {
                      const isCurrentMonth = item.type === 'current';

                      const cellDate =
                        item.type === 'prev'
                          ? new Date(year, month - 1, item.date)
                          : item.type === 'next'
                            ? new Date(year, month + 1, item.date)
                            : new Date(year, month, item.date);

                      const dateKey = formatDateKey(cellDate);
                      const dateSchedules = slottedByDate.get(dateKey) ?? [];

                      const isSunday = cellDate.getDay() === 0;
                      const isSaturday = cellDate.getDay() === 6;

                      const isToday =
                        today.getFullYear() === cellDate.getFullYear() &&
                        today.getMonth() === cellDate.getMonth() &&
                        today.getDate() === cellDate.getDate();

                      const isSelected =
                        selectedDate.getFullYear() === cellDate.getFullYear() &&
                        selectedDate.getMonth() === cellDate.getMonth() &&
                        selectedDate.getDate() === cellDate.getDate();

                      let singleIdx = 0;

                      return (
                        <button
                          type="button"
                          key={`${item.type}-${weekIndex}-${i}`}
                          onClick={() => {
                            setSelectedDate(cellDate);
                            setIsMobileDetailOpen(true);
                          }}
                          className={`relative flex flex-col items-center pt-1 pb-2 text-[13px] transition-all duration-150 outline-none active:scale-95 ${
                            isSelected ? 'rounded-xl bg-white' : ''
                          }`}
                          style={{ minHeight: `${cellMinH}px` }}
                        >
                          <span
                            className={`flex shrink-0 items-center justify-center rounded-full text-[14px] ${
                              !isCurrentMonth
                                ? 'h-6 w-6 text-[#D6DDE5]'
                                : isToday
                                  ? 'h-5 w-5 bg-[#5E92F0] font-semibold text-white'
                                  : isSunday
                                    ? 'h-6 w-6 text-red-500'
                                    : isSaturday
                                      ? 'h-6 w-6 text-blue-500'
                                      : 'h-6 w-6 text-[#5C5C5C]'
                            }`}
                          >
                            {item.date}
                          </span>

                          {dateSchedules.map((schedule) => {
                            const isDone = schedule.isFinished;
                            const startDate = schedule.startAt.slice(0, 10);
                            const endDate = schedule.endAt.slice(0, 10);

                            const isPeriod =
                              startDate !== endDate && schedule.isSingle;

                            const isPeriodStart =
                              isPeriod && dateKey === startDate;
                            const isPeriodEnd = isPeriod && dateKey === endDate;
                            const isPeriodMiddle =
                              isPeriod &&
                              dateKey > startDate &&
                              dateKey < endDate;

                            let topOffset: number;

                            if (schedule.slot !== -1) {
                              topOffset =
                                DATE_HEADER_H +
                                schedule.slot * (EVENT_H + EVENT_GAP);
                            } else {
                              const maxSlotOnThisDate = dateSchedules
                                .filter((s) => s.slot !== -1)
                                .reduce(
                                  (max, s) => Math.max(max, s.slot + 1),
                                  0
                                );

                              topOffset =
                                DATE_HEADER_H +
                                maxSlotOnThisDate * (EVENT_H + EVENT_GAP) +
                                singleIdx * (EVENT_H + EVENT_GAP);

                              singleIdx++;
                            }

                            return (
                              <div
                                key={`${schedule.eventId}-${schedule.occurrenceAt ?? schedule.startAt}`}
                                className={`absolute h-5 shrink-0 truncate border-l-4 text-left text-[9px] leading-5 font-semibold ${
                                  isDone ? 'border-l-transparent' : 'pl-1'
                                } ${
                                  isPeriod
                                    ? isPeriodStart
                                      ? 'mr-0 ml-1 rounded-l rounded-r-none'
                                      : isPeriodEnd
                                        ? 'mr-1 ml-0 rounded-l-none rounded-r'
                                        : isPeriodMiddle
                                          ? 'mx-0 rounded-none'
                                          : 'mx-1 rounded'
                                    : 'mx-1 rounded'
                                }`}
                                style={{
                                  top: `${topOffset}px`,
                                  left: 0,
                                  right: 0,
                                  backgroundColor:
                                    EVENT_COLOR_MAP[schedule.color],
                                  borderLeftColor:
                                    isDone || (isPeriod && !isPeriodStart)
                                      ? 'transparent'
                                      : darkenColor(
                                          EVENT_COLOR_MAP[schedule.color],
                                          25
                                        ),
                                  color: isDone
                                    ? darkenColor(
                                        EVENT_COLOR_MAP[schedule.color],
                                        70
                                      )
                                    : darkenColor(
                                        EVENT_COLOR_MAP[schedule.color],
                                        100
                                      ),
                                }}
                              >
                                {!isPeriodMiddle &&
                                  !isPeriodEnd &&
                                  schedule.title}
                              </div>
                            );
                          })}
                        </button>
                      );
                    });
                  })}
                </div>
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
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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
                    onClick={() => router.push(`/team/${teamId}/notice`)}
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
                            {getTeamRoleLabel(notice.teamRole)} •{' '}
                            {notice.authorName}
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
                      등록된 공지사항이 없습니다.
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
              {selectedSchedules.map((schedule) => {
                const isDone = schedule.isFinished;

                return (
                  <div
                    key={schedule.eventId}
                    onClick={() => {
                      if (!isAdmin) return;
                      setEditSchedule(schedule);
                    }}
                    className={`flex h-[58px] shrink-0 cursor-pointer items-center justify-between rounded-md border-l-4 px-4 text-left transition-all active:scale-95 ${
                      isDone ? 'border-l-transparent pl-3' : ''
                    }`}
                    style={{
                      backgroundColor: EVENT_COLOR_MAP[schedule.color],
                      borderLeftColor: isDone
                        ? 'transparent'
                        : darkenColor(EVENT_COLOR_MAP[schedule.color], 25),
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#5C5C5C]">
                        {schedule.title}
                      </p>

                      <p className="text-[11px] text-[#9D9D9D]">
                        {schedule.teamName ?? '개인 일정'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#9D9D9D]">
                        {schedule.isAllDay
                          ? '하루 종일'
                          : `${formatTime(schedule.startAt)}~${formatTime(
                              schedule.endAt
                            )}`}
                      </span>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSchedule(schedule.eventId);
                          }}
                          className="flex h-5 w-5 items-center justify-center"
                        >
                          {isDone ? (
                            <Check
                              size={16}
                              style={{
                                color: darkenColor(
                                  EVENT_COLOR_MAP[schedule.color],
                                  80
                                ),
                              }}
                            />
                          ) : (
                            <span
                              className="h-4 w-4 rounded-full border"
                              style={{
                                borderColor: darkenColor(
                                  EVENT_COLOR_MAP[schedule.color],
                                  80
                                ),
                              }}
                            />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
    </main>
  );
}
