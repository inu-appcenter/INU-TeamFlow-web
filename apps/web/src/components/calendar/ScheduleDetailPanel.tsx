'use client';

import { Plus } from 'lucide-react';
import type { Schedule } from '@moimi/core/types/event';
import { getDday } from '@/utils/date/getDday';
import ScheduleListItem from '@/components/calendar/ScheduleListItem';

type ScheduleDetailPanelProps = {
  selectedDate: Date;
  dayLabel: string;
  schedules: Schedule[];
  onClickItem: (schedule: Schedule) => void;
  onToggle: (schedule: Schedule) => void;
  onAddClick: () => void;
  titleClassName?: string;
};

export default function ScheduleDetailPanel({
  selectedDate,
  dayLabel,
  schedules,
  onClickItem,
  onToggle,
  onAddClick,
  titleClassName = 'mb-4',
}: ScheduleDetailPanelProps) {
  return (
    <>
      <div
        className={`flex shrink-0 items-center justify-between ${titleClassName}`}
      >
        <h2 className="text-[24px] font-bold text-[#2C2C2C]">
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({dayLabel}
          )
        </h2>

        <span className="text-sm text-[#C8D0D9]">{getDday(selectedDate)}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {schedules.map((schedule) => (
          <ScheduleListItem
            key={`${schedule.eventId}-${schedule.occurrenceAt ?? schedule.startAt}`}
            schedule={schedule}
            onClickItem={onClickItem}
            onToggle={onToggle}
          />
        ))}
      </div>

      <button
        onClick={onAddClick}
        className="mt-3 flex h-[58px] shrink-0 items-center gap-2 rounded-[10px] bg-[#EEF1F5] px-5 text-[16px] font-semibold text-[#2C2C2C]/60 transition-all duration-150 outline-none active:scale-90"
      >
        <Plus size={18} strokeWidth={2.5} />
        일정 추가
      </button>
    </>
  );
}
