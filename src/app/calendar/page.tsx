'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import CalendarAddModal from '@/components/calendar/CalendarAddModal';
import CalendarEditModal from '@/components/calendar/CalendarEditModal';
import type { Schedule, RecurrenceEditScope } from '@/types/event';
import { EVENT_COLOR_MAP } from '@/constants/scheduleColor';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { assignWeekSlots } from '@/utils/calendar/assignWeekSlots';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useCalendarEventActions } from '@/hooks/useCalendarEventActions';
import { useCalendarGrid } from '@/hooks/useCalendarGrid';
import { useMonthSchedules } from '@/hooks/useMonthSchedules';
import { formatDateKey, isScheduleOnDate } from '@/utils/date/calendar';
import { darkenColor } from '@/utils/color/darkenColor';
import ScheduleDetailPanel from '@/components/calendar/ScheduleDetailPanel';

const days = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const { errorMessage, showErrorMessage } = useErrorToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const {
    handleAddSchedule,
    handleEditSchedule: editSchedule_,
    handleDeleteSchedule: deleteSchedule_,
    handleToggleSchedule,
  } = useCalendarEventActions();
  const schedules = useMonthSchedules(year, month);
  const calendarDates = useCalendarGrid(year, month);
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
  const handleEditSchedule = async (
    updated: Schedule,
    scope: RecurrenceEditScope
  ) => {
    await editSchedule_(updated, scope);
    setEditSchedule(null);
  };
  const handleDeleteSchedule = async (
    eventId: number,
    scope: RecurrenceEditScope
  ) => {
    await deleteSchedule_(
      eventId,
      scope,
      editSchedule?.occurrenceAt ?? editSchedule?.startAt ?? ''
    );
    setEditSchedule(null);
  };
  const DATE_HEADER_H = 28;
  const EVENT_H = 20;
  const EVENT_GAP = 4;

  return (
    <main className="h-screen overflow-hidden px-3 py-6 pt-6 pb-28 sm:px-6 sm:pt-12 sm:pb-34">
      <section className="z-100 mx-auto flex h-full max-w-[1180px] flex-col">
        <div className="mb-2 flex items-center justify-between px-3">
          <h1 className="text-[28px] font-bold text-[#2C2C2C]">
            {month + 1}월
          </h1>

          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="z-100 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2c2c2c]/40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNextMonth}
              className="relative z-100 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2c2c2c]/40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        {errorMessage && (
          <div className="animate-modal-pop absolute top-32 left-1/2 z-300 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
            {errorMessage}
          </div>
        )}

        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <section className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border-[0.8px] border-[#D6DDE5] bg-white py-2 pt-3 pl-2">
            <div className="grid shrink-0 grid-cols-7 pr-2.5 text-center text-[15px] text-[#D6DDE5]">
              {days.map((day) => (
                <div key={day} className="mb-2">
                  {day}
                </div>
              ))}
            </div>

            <div
              className="thin-scrollbar min-h-0 flex-1 overflow-y-auto"
              style={{
                scrollbarGutter: 'stable',
              }}
            >
              <div
                className="grid min-h-full grid-cols-7"
                style={{
                  gridTemplateRows: `repeat(${weeks.length}, minmax(90px, auto))`,
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
                        className={`relative flex flex-col items-center pt-1 pb-2 text-[14px] transition-all duration-150 outline-none active:scale-90 ${
                          isSelected ? 'rounded-2xl bg-[#FAFAFA]' : ''
                        }`}
                        style={{ minHeight: `${cellMinH}px` }}
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
                                    : 'text-[#2c2c2c]'
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
                              .reduce((max, s) => Math.max(max, s.slot + 1), 0);

                            topOffset =
                              DATE_HEADER_H +
                              maxSlotOnThisDate * (EVENT_H + EVENT_GAP) +
                              singleIdx * (EVENT_H + EVENT_GAP);

                            singleIdx++;
                          }

                          return (
                            <div
                              key={`${schedule.eventId}-${schedule.occurrenceAt ?? schedule.startAt}-${dateKey}`}
                              className={`absolute h-5 shrink-0 truncate border-l-4 text-left text-[9px] leading-5 font-semibold transition-all duration-150 ${
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

          <aside className="hidden h-full w-[365px] flex-col rounded-2xl border-[0.8] border-[#D6DDE5] bg-white px-6 py-6 lg:flex">
            <ScheduleDetailPanel
              selectedDate={selectedDate}
              dayLabel={dayLabel}
              schedules={selectedSchedules}
              onClickItem={(schedule) => {
                if (schedule.teamId) {
                  showErrorMessage('팀 일정은 수정할 수 없습니다');
                  return;
                }
                setEditSchedule(schedule);
              }}
              onToggle={(schedule) => {
                if (schedule.teamId) {
                  showErrorMessage('팀 일정은 수정할 수 없습니다');
                  return;
                }
                handleToggleSchedule(schedule);
              }}
              onAddClick={() => setIsAddOpen(true)}
            />
          </aside>

          {isMobileDetailOpen && (
            <div
              onClick={() => setIsMobileDetailOpen(false)}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 px-5 transition-opacity duration-200 lg:hidden"
            >
              <aside
                onClick={(e) => e.stopPropagation()}
                className="animate-modal-pop flex h-[70vh] w-full max-w-[365px] flex-col rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white px-6 py-6"
              >
                <ScheduleDetailPanel
                  selectedDate={selectedDate}
                  dayLabel={dayLabel}
                  schedules={selectedSchedules}
                  titleClassName="mb-2"
                  onClickItem={(schedule) => {
                    if (schedule.teamId) {
                      showErrorMessage('팀 일정은 수정할 수 없습니다');
                      return;
                    }
                    setEditSchedule(schedule);
                  }}
                  onToggle={(schedule) => {
                    if (schedule.teamId) {
                      showErrorMessage('팀 일정은 수정할 수 없습니다');
                      return;
                    }
                    handleToggleSchedule(schedule);
                  }}
                  onAddClick={() => {
                    setIsMobileDetailOpen(false);
                    setIsAddOpen(true);
                  }}
                />
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

      <CalendarEditModal
        key={`${editSchedule?.eventId}-${editSchedule?.occurrenceAt ?? ''}`}
        open={editSchedule !== null}
        schedule={editSchedule}
        onClose={() => setEditSchedule(null)}
        onEdit={handleEditSchedule}
        onDelete={handleDeleteSchedule}
      />

      <BottomNav />
    </main>
  );
}
