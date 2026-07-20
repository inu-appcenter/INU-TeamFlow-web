import type { Schedule } from '@/types/event';

export type CalendarDate = {
  date: number;
  type: 'prev' | 'current' | 'next';
};

export const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const isScheduleOnDate = (schedule: Schedule, dateKey: string) => {
  // 반복 일정이면 occurrenceAt 기준 우선 처리
  if (!schedule.isSingle && schedule.occurrenceAt) {
    // THIS_INSTANCE로 반복 일정을 수정한 경우, occurrenceAt과 startAt이 다를 수 있음 -> startAt 기준으로 비교
    if (schedule.occurrenceAt != schedule.startAt) {
      return schedule.startAt.slice(0, 10) === dateKey;
    }
    return schedule.occurrenceAt.slice(0, 10) === dateKey;
  }

  // 일반 일정 / 기간 일정 fallback
  const startDate = schedule.startAt.slice(0, 10);
  const endDate = schedule.endAt.slice(0, 10);
  return dateKey >= startDate && dateKey <= endDate;
};
