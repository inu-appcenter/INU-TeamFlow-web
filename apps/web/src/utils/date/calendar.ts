import type { Schedule } from '@moimi/core/types/event';

// 달력 그리드에서 각 칸이 이전달/이번달/다음달 날짜인지 구분하는 타입
export type CalendarDate = {
  date: number;
  type: 'prev' | 'current' | 'next';
};

// Date 객체 → "YYYY-MM-DD" 문자열 키로 변환
export const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 특정 일정(schedule)이 주어진 날짜(dateKey)에 표시되어야 하는지 판단
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
