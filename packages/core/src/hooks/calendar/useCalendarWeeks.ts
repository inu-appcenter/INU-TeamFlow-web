import { useMemo } from 'react';
import type { CalendarDate } from '@/utils/date/calendar';

export function useCalendarWeeks(calendarDates: CalendarDate[]) {
  return useMemo(
    () =>
      Array.from({ length: calendarDates.length / 7 }, (_, weekIndex) =>
        calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7)
      ),
    [calendarDates]
  );
}
