'use client';

import type { Schedule } from '@/types/event';
import type { CalendarDate } from '@/utils/date/calendar';
import { formatDateKey } from '@/utils/date/calendar';
import { assignWeekSlots } from '@/utils/calendar/assignWeekSlots';
import { darkenColor } from '@/utils/color/darkenColor';
import { EVENT_COLOR_MAP } from '@/constants/scheduleColor';

const DATE_HEADER_H = 28;
const EVENT_H = 20;
const EVENT_GAP = 4;

type MonthGridWithEventsProps = {
  year: number;
  month: number;
  weeks: CalendarDate[][];
  schedules: Schedule[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  rowMinHeight?: number; // 90 (CalendarPage) | 86 (TeamDetail)
  selectedCellClassName?: string; // 'rounded-2xl bg-[#FAFAFA]' | 'rounded-xl bg-white'
  cellTextSize?: string; // 'text-[14px]' | 'text-[13px]'
  todayCircleSize?: string; // 'h-5 w-5' 공통
  otherCircleSize?: string; // 'h-5 w-5' | 'h-6 w-6'
};

export default function MonthGridWithEvents({
  year,
  month,
  weeks,
  schedules,
  selectedDate,
  onSelectDate,
  rowMinHeight = 90,
  selectedCellClassName = 'rounded-2xl bg-[#FAFAFA]',
  cellTextSize = 'text-[14px]',
  todayCircleSize = 'h-5 w-5',
  otherCircleSize = 'h-6 w-6',
}: MonthGridWithEventsProps) {
  const today = new Date();

  return (
    <div
      className="grid min-h-full grid-cols-7"
      style={{
        gridTemplateRows: `repeat(${weeks.length}, minmax(${rowMinHeight}px, auto))`,
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

        const slottedByDate = assignWeekSlots(weekDateKeys, schedules);

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
              onClick={() => onSelectDate(cellDate)}
              className={`relative flex flex-col items-center pt-1 pb-2 ${cellTextSize} transition-all duration-150 outline-none active:scale-95 ${
                isSelected ? selectedCellClassName : ''
              }`}
              style={{ minHeight: `${cellMinH}px` }}
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full ${
                  isToday ? todayCircleSize : otherCircleSize
                } text-[14px] ${
                  !isCurrentMonth
                    ? 'text-[#D6DDE5]'
                    : isToday
                      ? 'bg-[#5E92F0] font-semibold text-white'
                      : isSunday
                        ? 'text-red-500'
                        : isSaturday
                          ? 'text-blue-500'
                          : 'text-[#5C5C5C]'
                }`}
              >
                {item.date}
              </span>

              {dateSchedules.map((schedule) => {
                const isDone = schedule.isFinished;
                const startDate = schedule.startAt.slice(0, 10);
                const endDate = schedule.endAt.slice(0, 10);

                const isPeriod = startDate !== endDate && schedule.isSingle;
                const isPeriodStart = isPeriod && dateKey === startDate;
                const isPeriodEnd = isPeriod && dateKey === endDate;
                const isPeriodMiddle =
                  isPeriod && dateKey > startDate && dateKey < endDate;

                let topOffset: number;
                if (schedule.slot !== -1) {
                  topOffset =
                    DATE_HEADER_H + schedule.slot * (EVENT_H + EVENT_GAP);
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
                    key={`${schedule.eventId}-${schedule.occurrenceAt ?? schedule.startAt}`}
                    className={`absolute h-5 shrink-0 truncate border-l-4 text-left text-[9px] leading-5 font-semibold transition-all duration-150 ${
                      isDone ? 'border-l-transparent' : 'pl-1'
                    } ${
                      schedule.teamId && schedule.isParticipant === false
                        ? 'opacity-40'
                        : ''
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
                      backgroundColor: EVENT_COLOR_MAP[schedule.color],
                      borderLeftColor:
                        isDone || (isPeriod && !isPeriodStart)
                          ? 'transparent'
                          : darkenColor(EVENT_COLOR_MAP[schedule.color], 25),
                      color: isDone
                        ? darkenColor(EVENT_COLOR_MAP[schedule.color], 70)
                        : darkenColor(EVENT_COLOR_MAP[schedule.color], 100),
                    }}
                  >
                    {!isPeriodMiddle && !isPeriodEnd && schedule.title}
                  </div>
                );
              })}
            </button>
          );
        });
      })}
    </div>
  );
}
