import { useMemo } from 'react';
import type { CalendarDate } from '@/utils/date/calendar';

export function useCalendarGrid(year: number, month: number) {
  return useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    const prevMonthDates: CalendarDate[] = Array.from(
      { length: firstDay },
      (_, i) => ({ date: prevLastDate - firstDay + i + 1, type: 'prev' })
    );

    const currentMonthDates: CalendarDate[] = Array.from(
      { length: lastDate },
      (_, i) => ({ date: i + 1, type: 'current' })
    );

    const totalDateCount = prevMonthDates.length + currentMonthDates.length;
    const nextMonthCount = (7 - (totalDateCount % 7)) % 7;

    const nextMonthDates: CalendarDate[] = Array.from(
      { length: nextMonthCount },
      (_, i) => ({ date: i + 1, type: 'next' })
    );

    return [...prevMonthDates, ...currentMonthDates, ...nextMonthDates];
  }, [year, month]);
}
