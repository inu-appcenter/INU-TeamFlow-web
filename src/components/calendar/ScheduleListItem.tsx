'use client';

import { Check, MoveHorizontal, Repeat } from 'lucide-react';
import type { Schedule } from '@/types/event';
import { EVENT_COLOR_MAP } from '@/constants/scheduleColor';
import { formatTime } from '@/utils/date/formatTime';
import { darkenColor } from '@/utils/color/darkenColor';

type ScheduleListItemProps = {
  schedule: Schedule;
  onClickItem: (schedule: Schedule) => void;
  onToggle: (schedule: Schedule) => void;
  showToggle?: boolean;
};

export default function ScheduleListItem({
  schedule,
  onClickItem,
  onToggle,
  showToggle = true,
}: ScheduleListItemProps) {
  const isDone = schedule.isFinished;
  const isPeriod =
    schedule.startAt.slice(0, 10) !== schedule.endAt.slice(0, 10) &&
    schedule.isSingle;

  return (
    <div
      onClick={() => onClickItem(schedule)}
      className={`flex h-[58px] shrink-0 cursor-pointer items-center justify-between rounded-md border-l-6 px-3 text-left transition-all duration-150 outline-none active:scale-95 ${
        isDone ? 'border-l-transparent pl-2' : ''
      }`}
      style={{
        backgroundColor: EVENT_COLOR_MAP[schedule.color],
        borderLeftColor: isDone
          ? 'transparent'
          : darkenColor(EVENT_COLOR_MAP[schedule.color], 25),
      }}
    >
      <div>
        <p className="text-sm font-semibold text-[#5C5C5C]">{schedule.title}</p>
        <p className="text-[11px] text-[#9D9D9D]">
          {schedule.teamName ?? '개인 일정'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#9D9D9D]">
          {schedule.isAllDay
            ? '하루 종일'
            : `${formatTime(schedule.startAt)}~${formatTime(schedule.endAt)}`}
        </span>

        {!schedule.isSingle && (
          <Repeat size={14} className="shrink-0 text-[#9D9D9D]" />
        )}

        {isPeriod && (
          <MoveHorizontal size={16} className="shrink-0 text-[#9D9D9D]" />
        )}

        {showToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(schedule);
            }}
            className="flex h-5 w-5 cursor-pointer items-center justify-center"
          >
            {isDone ? (
              <Check
                size={16}
                style={{
                  color: darkenColor(EVENT_COLOR_MAP[schedule.color], 80),
                }}
              />
            ) : (
              <span
                className="h-4 w-4 rounded-full border"
                style={{
                  borderColor: darkenColor(EVENT_COLOR_MAP[schedule.color], 80),
                }}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
