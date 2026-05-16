'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import CalendarAddModal from '@/components/calendar/CalendarAddModal';
import { schedules as mockSchedules, type Schedule } from '@/mocks/schedules';
import { getDday } from '@/utils/date/getDday';
import { Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import type { CreateEventRequest } from '@/components/calendar/CalendarAddModal';

const days = ['일', '월', '화', '수', '목', '금', '토'];

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

const formatTime = (dateString: string) => {
  return dateString.slice(11, 16);
};

const isScheduleOnDate = (schedule: Schedule, dateKey: string) => {
  const startDate = schedule.startAt.slice(0, 10);
  const endDate = schedule.endAt.slice(0, 10);

  if (!schedule.isSingle && schedule.recurrence) {
    if (dateKey < startDate || dateKey > endDate) return false;

    const targetDate = new Date(dateKey);
    const targetDay = targetDate.getDay();

    if (schedule.recurrence.frequency === 'WEEKLY') {
      return schedule.recurrence.daysOfWeek?.includes(targetDay) ?? false;
    }

    if (schedule.recurrence.frequency === 'MONTHLY') {
      return targetDate.getDate() === new Date(startDate).getDate();
    }

    if (schedule.recurrence.frequency === 'YEARLY') {
      const start = new Date(startDate);

      return (
        targetDate.getMonth() === start.getMonth() &&
        targetDate.getDate() === start.getDate()
      );
    }
  }

  return dateKey >= startDate && dateKey <= endDate;
};

export default function CalendarPage() {
  const today = new Date();
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const handleToggleSchedule = (eventId: number) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.eventId === eventId
          ? {
              ...schedule,
              isFinished: !schedule.isFinished,
            }
          : schedule
      )
    );
  };

  const handleAddSchedule = (request: CreateEventRequest) => {
    const mockResponse: Schedule = {
      eventId: Date.now(),
      teamId: 1,
      teamName: '새 팀',

      title: request.title,
      description: request.description,

      occurrenceAt: request.startAt,
      startAt: request.startAt,
      endAt: request.endAt,

      isAllDay: request.isAllDay,
      color: request.color,

      isSingle: request.recurrence === null,
      isFinished: false,
      isException: false,

      recurrence: request.recurrence,
    };

    setSchedules((prev) => [...prev, mockResponse]);
  };

  const darkenColor = (hex: string, amount: number) => {
    const color = hex.replace('#', '');

    const r = Math.max(0, parseInt(color.substring(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(color.substring(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(color.substring(4, 6), 16) - amount);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <main className="h-screen overflow-hidden px-3 py-6 pt-6 pb-28 sm:px-6 sm:pt-12 sm:pb-34">
      <section className="mx-auto flex h-full max-w-[1180px] flex-col">
        <div className="mb-2 flex items-center justify-between px-3">
          <h1 className="text-[28px] font-bold text-[#2C2C2C]">
            {month + 1}월
          </h1>

          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8ECF0] text-[#2c2c2c]/40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8ECF0] text-[#2c2c2c]/40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <section className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white p-2 pt-3">
            <div className="grid shrink-0 grid-cols-7 text-center text-[15px] text-[#D6DDE5]">
              {days.map((day) => (
                <div key={day} className="mb-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
              <div
                className="grid min-h-full grid-cols-7"
                style={{
                  gridTemplateRows: `repeat(${weeks.length}, minmax(90px, auto))`,
                }}
              >
                {weeks.map((week, weekIndex) =>
                  week.map((item, i) => {
                    const isCurrentMonth = item.type === 'current';

                    const cellDate =
                      item.type === 'prev'
                        ? new Date(year, month - 1, item.date)
                        : item.type === 'next'
                          ? new Date(year, month + 1, item.date)
                          : new Date(year, month, item.date);

                    const dateKey = formatDateKey(cellDate);

                    const dateSchedules = schedules
                      .filter((schedule) => isScheduleOnDate(schedule, dateKey))
                      .sort((a, b) => {
                        const aStart = a.startAt.slice(0, 10);
                        const aEnd = a.endAt.slice(0, 10);
                        const bStart = b.startAt.slice(0, 10);
                        const bEnd = b.endAt.slice(0, 10);

                        const aIsPeriod = aStart !== aEnd && a.isSingle;
                        const bIsPeriod = bStart !== bEnd && b.isSingle;

                        if (aIsPeriod && !bIsPeriod) return -1;
                        if (!aIsPeriod && bIsPeriod) return 1;

                        return a.startAt.localeCompare(b.startAt);
                      });

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

                    return (
                      <button
                        type="button"
                        key={`${item.type}-${weekIndex}-${i}`}
                        onClick={() => {
                          setSelectedDate(cellDate);
                          setIsMobileDetailOpen(true);
                        }}
                        className={`text-[14px]transition-all relative flex min-h-[90px] flex-col items-center pt-1 pb-2 duration-150 outline-none active:scale-90 ${
                          isSelected ? 'rounded-2xl bg-[#FAFAFA]' : ''
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            !isCurrentMonth
                              ? 'text-[#D6DDE5]'
                              : isToday
                                ? 'bg-[#5E92F0] text-white'
                                : isSunday
                                  ? 'text-red-500'
                                  : isSaturday
                                    ? 'text-blue-500'
                                    : 'text-[#5C5C5C]'
                          }`}
                        >
                          {item.date}
                        </span>

                        <div className="mt-1 flex w-full flex-col gap-1">
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

                            return (
                              <div
                                key={schedule.eventId}
                                className={`h-5 shrink-0 truncate border-l-4 text-left text-[9px] leading-5 font-semibold ${
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
                                  backgroundColor: schedule.color,
                                  borderLeftColor:
                                    isDone || (isPeriod && !isPeriodStart)
                                      ? 'transparent'
                                      : darkenColor(schedule.color, 25),
                                  color: isDone
                                    ? darkenColor(schedule.color, 70)
                                    : darkenColor(schedule.color, 100),
                                }}
                              >
                                {!isPeriodMiddle &&
                                  !isPeriodEnd &&
                                  schedule.title}
                              </div>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <aside className="hidden h-full w-[365px] flex-col rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white px-6 py-6 lg:flex">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <h2 className="text-[24px] font-bold text-[#2C2C2C]">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 (
                {dayLabel})
              </h2>

              <span className="text-sm text-[#C8D0D9]">
                {getDday(selectedDate)}
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {selectedSchedules.map((schedule) => {
                const isDone = schedule.isFinished;

                return (
                  <div
                    key={schedule.eventId}
                    className={`flex h-[58px] shrink-0 items-center justify-between rounded-md border-l-4 px-4 text-left transition-all duration-150 outline-none active:scale-95 ${
                      isDone ? 'border-l-transparent' : ''
                    }`}
                    style={{
                      backgroundColor: schedule.color,
                      borderLeftColor: isDone
                        ? 'transparent'
                        : darkenColor(schedule.color, 25),
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

                      <button
                        type="button"
                        onClick={() => handleToggleSchedule(schedule.eventId)}
                        className="flex h-5 w-5 items-center justify-center"
                      >
                        {isDone ? (
                          <Check
                            size={16}
                            style={{
                              color: darkenColor(schedule.color, 80),
                            }}
                          />
                        ) : (
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{
                              borderColor: darkenColor(schedule.color, 80),
                            }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-3 flex h-[58px] shrink-0 items-center gap-2 rounded-[10px] bg-[#EEF1F5] px-5 text-[14px] font-semibold text-[#2C2C2C]/60 transition-all duration-150 outline-none active:scale-90"
            >
              <Plus size={16} />
              일정 추가
            </button>
          </aside>

          {isMobileDetailOpen && (
            <div
              onClick={() => setIsMobileDetailOpen(false)}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 px-5 lg:hidden"
            >
              <aside
                onClick={(e) => e.stopPropagation()}
                className="flex h-[70vh] w-full max-w-[365px] flex-col rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white px-6 py-6"
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
                        className={`flex h-[58px] shrink-0 items-center justify-between rounded-md border-l-4 px-4 text-left transition-all duration-150 outline-none active:scale-95 ${
                          isDone ? 'border-l-transparent' : ''
                        }`}
                        style={{
                          backgroundColor: schedule.color,
                          borderLeftColor: isDone
                            ? 'transparent'
                            : darkenColor(schedule.color, 25),
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

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleSchedule(schedule.eventId)
                            }
                            className="flex h-5 w-5 items-center justify-center"
                          >
                            {isDone ? (
                              <Check
                                size={16}
                                style={{
                                  color: darkenColor(schedule.color, 80),
                                }}
                              />
                            ) : (
                              <span
                                className="h-4 w-4 rounded-full border"
                                style={{
                                  borderColor: darkenColor(schedule.color, 80),
                                }}
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setIsMobileDetailOpen(false);
                    setIsAddOpen(true);
                  }}
                  className="mt-3 flex h-[58px] shrink-0 items-center gap-2 rounded-[10px] bg-[#EEF1F5] px-5 text-[14px] font-semibold text-[#2C2C2C]/60 transition-all duration-150 outline-none active:scale-90"
                >
                  <Plus size={16} />
                  일정 추가
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>

      <CalendarAddModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSchedule}
        selectedDate={selectedDate}
      />

      <BottomNav />
    </main>
  );
}
