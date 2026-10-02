'use client';

import { EVENT_COLOR_MAP } from '@moimi/core/constants/scheduleColor';
import type { Schedule } from '@moimi/core/types/event';

type DaySchedulePanelProps = {
  selectedDate: Date;
  selectedSchedules: Schedule[];
};

export default function DaySchedulePanel({
  selectedDate,
  selectedSchedules,
}: DaySchedulePanelProps) {
  return (
    <aside className="hidden h-full min-h-0 rounded-2xl bg-[#F6F8FA] py-4 pr-2 pl-4 md:flex md:flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2C2C2C]">
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
        </h3>
      </div>

      <div
        className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
        style={{ scrollbarGutter: 'stable' }}
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
                  style={{ backgroundColor: EVENT_COLOR_MAP[schedule.color] }}
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
  );
}
