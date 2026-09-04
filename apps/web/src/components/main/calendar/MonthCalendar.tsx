'use client';

import { EVENT_COLOR_MAP } from '@/constants/scheduleColor';
import { formatDateKey, isScheduleOnDate } from '@/utils/date/calendar';
import type { CalendarDate } from '@/utils/date/calendar';
import type { Schedule } from '@/types/event';

const days = ['일', '월', '화', '수', '목', '금', '토'];

type MonthCalendarProps = {
  year: number;
  month: number;
  calendarDates: CalendarDate[];
  schedules: Schedule[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function MonthCalendar({
  year,
  month,
  calendarDates,
  schedules,
  selectedDate,
  onSelectDate,
}: MonthCalendarProps) {
  const today = new Date();

  return (
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
            .filter((schedule) => isScheduleOnDate(schedule, dateKey))
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
              onClick={() => onSelectDate(cellDate)}
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
                      backgroundColor: EVENT_COLOR_MAP[schedule.color],
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
