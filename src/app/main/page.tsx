'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import Card from '@/components/main/Card';

import { useMyTeamNotices } from '@/hooks/useNoticeQuery';

import { useMyEvents } from '@/hooks/useEventQuery';
import { useRecruitments } from '@/hooks/useRecruitmentQuery';
import type { Schedule } from '@/types/event';
import { EVENT_COLOR_MAP } from '@/constants/scheduleColor';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { formatDate } from '@/utils/date/formatDate';
import { getTeamRoleLabel } from '@/utils/teamRole';

const days = ['일', '월', '화', '수', '목', '금', '토'];

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const categories = [
  { label: '전체', value: 'ALL' },
  { label: '공모전', value: 'CONTEST' },
  { label: '스터디', value: 'STUDY' },
  { label: '프로젝트', value: 'PROJECT' },
  { label: '동아리', value: 'CLUB' },
  { label: '기타', value: 'ETC' },
];

const categoryColorMap = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

type CalendarDate = {
  date: number;
  type: 'prev' | 'current' | 'next';
};

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

const isScheduleOnDate = (schedule: Schedule, dateKey: string) => {
  // 반복 일정이면 occurrenceAt 기준 우선 처리 (CalendarPage 방식)
  if (!schedule.isSingle && schedule.occurrenceAt) {
    return schedule.occurrenceAt.slice(0, 10) === dateKey;
  }

  // 일반 일정 / 기간 일정 fallback
  const startDate = schedule.startAt.slice(0, 10);
  const endDate = schedule.endAt.slice(0, 10);

  return dateKey >= startDate && dateKey <= endDate;
};

export default function Main() {
  const router = useRouter();
  const today = new Date();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [selectedDate, setSelectedDate] = useState(today);
  const selectedDateKey = formatDateKey(selectedDate);

  const { data: prevSchedules = [] } = useMyEvents(
    month === 0 ? year - 1 : year,
    month === 0 ? 12 : month
  );
  const { data: currentSchedules = [] } = useMyEvents(year, month + 1);
  const { data: nextSchedules = [] } = useMyEvents(
    month === 11 ? year + 1 : year,
    month === 11 ? 1 : month + 2
  );

  const schedules = Array.from(
    new Map(
      [...prevSchedules, ...currentSchedules, ...nextSchedules].map((s) => [
        `${s.eventId}-${s.occurrenceAt ?? s.startAt}`,
        s,
      ])
    ).values()
  );

  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );

  const { data: recruitmentData } = useRecruitments(0, 100);
  const recruitments = recruitmentData?.content ?? [];

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

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const filteredRecruitments = recruitments.filter((recruitment) => {
    if (selectedCategory === 'ALL') return true;

    return recruitment.category === selectedCategory;
  });

  const mobileRecruitments = filteredRecruitments.slice(0, 4);
  const desktopRecruitments = filteredRecruitments.slice(0, 3);

  const { data: myNotices = [] } = useMyTeamNotices();

  const sortedNotices = [...myNotices].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  const mobileNotices = sortedNotices.slice(0, 5);
  const desktopNotices = sortedNotices.slice(0, 4);

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        {/* 상단 */}
        <section className="relative mb-10 pt-4 md:min-h-[160px]">
          <div className="h-12 w-40 rounded-full bg-white" />
          <div className="absolute top-4 left-1/2 hidden h-36 w-[50%] max-w-3xl -translate-x-1/2 rounded-2xl bg-white md:block" />
          <NotificationButton />
        </section>

        {/* 캘린더 + 공지사항 */}
        <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 캘린더 */}
          <div className="lg:col-span-7">
            <Card className="h-[400px] overflow-hidden p-6">
              <div className="mb-3 flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">
                  {month + 1}월
                </h2>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#F6F8FA] text-[#2c2c2c]/40 transition-all duration-150 active:scale-90"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#F6F8FA] text-[#2c2c2c]/40 transition-all duration-150 active:scale-90"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid h-[305px] grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="flex h-full min-h-0 flex-col">
                  {/* 요일 */}
                  <div className="grid grid-cols-7 text-center text-[13px] text-[#D6DDE5]">
                    {days.map((day) => (
                      <div key={day} className="mb-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* 날짜 : 7로 나눈 몫으로 행 결정 */}
                  <div
                    className="grid flex-1 grid-cols-7"
                    style={{
                      gridTemplateRows: `repeat(${Math.ceil(calendarDates.length / 7)}, 1fr)`,
                    }}
                  >
                    {calendarDates.map((item, index) => {
                      const cellDate =
                        item.type === 'prev'
                          ? new Date(year, month - 1, item.date)
                          : item.type === 'next'
                            ? new Date(year, month + 1, item.date)
                            : new Date(year, month, item.date);

                      const dateKey = formatDateKey(cellDate);

                      const dateSchedules = schedules
                        .filter((schedule) =>
                          isScheduleOnDate(schedule, dateKey)
                        )
                        .slice(0, 3);

                      const isCurrentMonth = item.type === 'current';

                      const isToday =
                        today.getFullYear() === cellDate.getFullYear() &&
                        today.getMonth() === cellDate.getMonth() &&
                        today.getDate() === cellDate.getDate();

                      const isSelected =
                        selectedDate.getFullYear() === cellDate.getFullYear() &&
                        selectedDate.getMonth() === cellDate.getMonth() &&
                        selectedDate.getDate() === cellDate.getDate();

                      return (
                        <button
                          key={`${item.type}-${item.date}-${index}`}
                          type="button"
                          onClick={() => setSelectedDate(cellDate)}
                          className={`relative flex h-full flex-col items-start rounded-[12px] px-1 pt-1 transition-all duration-150 hover:bg-[#FAFAFA] active:scale-95 ${
                            isSelected ? 'bg-[#FAFAFA]' : ''
                          }`}
                        >
                          <span
                            className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[12px] ${
                              !isCurrentMonth
                                ? 'text-[#D6DDE5]'
                                : isToday
                                  ? 'bg-[#5E92F0] text-white'
                                  : cellDate.getDay() === 0
                                    ? 'text-red-500'
                                    : cellDate.getDay() === 6
                                      ? 'text-blue-500'
                                      : 'text-[#2c2c2c]'
                            }`}
                          >
                            {item.date}
                          </span>

                          <div
                            className={`flex w-full flex-col gap-0.5 ${
                              dateSchedules.length > 1 ? 'mt-0' : 'mt-1'
                            }`}
                          >
                            {dateSchedules.map((schedule) => (
                              <div
                                key={schedule.eventId}
                                className="h-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    EVENT_COLOR_MAP[schedule.color],
                                }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <aside className="hidden h-full min-h-0 rounded-2xl bg-[#F6F8FA] py-4 pr-2 pl-4 md:flex md:flex-col">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#2C2C2C]">
                      {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                      일정
                    </h3>
                  </div>

                  <div
                    className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
                    style={{
                      scrollbarGutter: 'stable',
                    }}
                  >
                    {selectedSchedules.length > 0 ? (
                      selectedSchedules.map((schedule) => (
                        <div
                          key={schedule.eventId}
                          className="rounded-xl bg-white p-3 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  EVENT_COLOR_MAP[schedule.color],
                              }}
                            />

                            <p className="truncate text-sm font-semibold text-[#2C2C2C]">
                              {schedule.title}
                            </p>
                          </div>

                          <p className="mt-1 truncate text-xs text-[#989898]">
                            {schedule.teamName ?? '개인 일정'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="mb-4 flex flex-1 items-center justify-center">
                        <p className="text-sm font-medium text-[#989898]">
                          일정이 없습니다
                        </p>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </Card>
          </div>

          {/* 공지사항 */}
          <div className="lg:col-span-5">
            <Card className="h-[400px] p-6">
              <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">공지사항</h2>

                <button
                  type="button"
                  onClick={() => router.push('/notice')}
                  className="z-50 cursor-pointer text-[#2C2C2C] transition hover:text-[#2C2C2C]/80 active:scale-90"
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="mt-0 flex flex-col sm:hidden">
                {mobileNotices.map((notice) => (
                  <button
                    key={notice.noticeId}
                    type="button"
                    onClick={() =>
                      router.push(
                        `/team/${notice.teamId}/notice/${notice.noticeId}?from=home`
                      )
                    }
                    className="z-50 border-b-[0.5px] border-[#D6DDE5] py-3 text-left last:border-b-0 active:scale-[0.99]"
                  >
                    <h3 className="truncate text-[15px] font-semibold text-[#2C2C2C]">
                      [ {notice.teamName} ] {notice.title}
                    </h3>

                    <p className="mt-0.5 truncate text-[11px] text-[#989898]">
                      {notice.authorName} · {getTeamRoleLabel(notice.teamRole)}{' '}
                      · {formatDate(notice.createdAt)}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-0 hidden flex-col sm:flex">
                {desktopNotices.map((notice) => (
                  <button
                    key={notice.noticeId}
                    type="button"
                    onClick={() =>
                      router.push(
                        `/team/${notice.teamId}/notice/${notice.noticeId}?from=home`
                      )
                    }
                    className="z-50 border-b-[0.5px] border-[#D6DDE5] py-4 text-left last:border-b-0 active:scale-[0.99]"
                  >
                    <h3 className="truncate text-[17px] font-semibold text-[#2C2C2C]">
                      [ {notice.teamName} ] {notice.title}
                    </h3>

                    <p className="mt-1.5 truncate text-xs text-[#989898]">
                      {notice.authorName} · {getTeamRoleLabel(notice.teamRole)}{' '}
                      · {formatDate(notice.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* 모집 게시판 + 정보 게시판 */}
        <section className="mb-28 grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* 모집 게시판 */}
          <div className="xl:col-span-6">
            <Card className="h-[345px] overflow-hidden p-6 sm:h-[350px]">
              <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">
                  모집 게시판
                </h2>

                <button
                  type="button"
                  onClick={() => router.push('/recruitment')}
                  className="z-50 cursor-pointer text-[#2C2C2C] transition hover:text-[#2C2C2C]/80 active:scale-90"
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    className={`z-50 cursor-pointer rounded-2xl border-[0.5px] px-2.5 py-1 text-sm font-normal transition-all duration-150 active:scale-95 sm:px-3.5 sm:py-1.5 sm:text-base ${
                      selectedCategory === category.value
                        ? 'border-[#D6DDE5] bg-[#5E92F0] text-white'
                        : 'border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C] hover:bg-[#E3E7EC]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="mt-0 flex flex-col sm:hidden">
                {mobileRecruitments.map((recruitment) => (
                  <button
                    key={recruitment.recruitmentId}
                    type="button"
                    onClick={() =>
                      router.push(`/recruitment/${recruitment.recruitmentId}`)
                    }
                    className="z-50 cursor-pointer border-b-[0.5px] border-[#D6DDE5] py-3 text-left last:border-b-0 active:scale-[0.99]"
                  >
                    <h3 className="truncate text-[15px] font-semibold text-[#2C2C2C]">
                      [ {categoryMap[recruitment.category]} ]{' '}
                      {recruitment.title}
                    </h3>

                    <p
                      className={`mt-1 truncate text-xs ${
                        recruitment.announcementTitle
                          ? 'text-[#2C2C2C]'
                          : 'text-[#B0B0B0]'
                      }`}
                    >
                      {recruitment.announcementTitle ||
                        '연결된 정보글이 없습니다'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-1 hidden flex-col sm:flex">
                {desktopRecruitments.map((recruitment) => (
                  <button
                    key={recruitment.recruitmentId}
                    type="button"
                    onClick={() =>
                      router.push(`/recruitment/${recruitment.recruitmentId}`)
                    }
                    className="z-50 cursor-pointer border-b-[0.5px] border-[#D6DDE5] py-3.5 text-left last:border-b-0 active:scale-[0.99]"
                  >
                    <h3 className="truncate text-[17px] font-semibold text-[#2C2C2C]">
                      [ {categoryMap[recruitment.category]} ]{' '}
                      {recruitment.title}
                    </h3>

                    <p
                      className={`mt-1 truncate text-xs ${
                        recruitment.announcementTitle
                          ? 'text-[#2C2C2C]'
                          : 'text-[#B0B0B0]'
                      }`}
                    >
                      {recruitment.announcementTitle ||
                        '연결된 정보글이 없습니다'}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* 정보 게시판 */}
          <div className="xl:col-span-6">
            <Card className="h-[345px] overflow-hidden p-6 sm:h-[350px]">
              <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">
                  정보 게시판
                </h2>

                <button
                  type="button"
                  className="z-50 cursor-pointer text-[#2C2C2C] transition hover:text-[#2C2C2C]/80 active:scale-90"
                >
                  <ChevronRight />
                </button>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
