import { useMemo } from 'react';
import { useMyEvents } from '@/hooks/useEventQuery';

export function useMonthSchedules(year: number, month: number) {
  const { data: prevSchedules = [] } = useMyEvents(
    month === 0 ? year - 1 : year,
    month === 0 ? 12 : month
  );
  const { data: currentSchedules = [] } = useMyEvents(year, month + 1);
  const { data: nextSchedules = [] } = useMyEvents(
    month === 11 ? year + 1 : year,
    month === 11 ? 1 : month + 2
  );

  return useMemo(
    () =>
      Array.from(
        new Map(
          [...prevSchedules, ...currentSchedules, ...nextSchedules].map((s) => [
            `${s.eventId}-${s.occurrenceAt ?? s.startAt}`,
            s,
          ])
        ).values()
      ),
    [prevSchedules, currentSchedules, nextSchedules]
  );
}
