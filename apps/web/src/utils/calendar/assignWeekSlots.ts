import type { Schedule } from '@/types/event';
import { isScheduleOnDate } from '@/utils/date/calendar';

export type SlottedSchedule = Schedule & { slot: number };

export function assignWeekSlots(
  weekDateKeys: string[],
  schedules: Schedule[]
): Map<string, SlottedSchedule[]> {
  const seen = new Set<string>();
  const weekSchedules: Schedule[] = [];

  for (const dk of weekDateKeys) {
    for (const s of schedules) {
      const key = `${s.eventId}-${s.occurrenceAt ?? s.startAt}`;

      if (!seen.has(key) && isScheduleOnDate(s, dk)) {
        seen.add(key);
        weekSchedules.push(s);
      }
    }
  }

  const periodSchedules = weekSchedules.filter((s) => {
    const start = s.startAt.slice(0, 10);
    const end = s.endAt.slice(0, 10);
    return start !== end && s.isSingle;
  });
  const singleSchedules = weekSchedules.filter((s) => {
    const start = s.startAt.slice(0, 10);
    const end = s.endAt.slice(0, 10);
    return !(start !== end && s.isSingle);
  });

  // 이 주에 실제로 보이는 날짜 범위로 클램핑해서 겹침 판단
  const weekStart = weekDateKeys[0];
  const weekEnd = weekDateKeys[weekDateKeys.length - 1];

  const clampToWeek = (start: string, end: string) => ({
    cs: start < weekStart ? weekStart : start,
    ce: end > weekEnd ? weekEnd : end,
  });

  const slotMap: SlottedSchedule[] = [];
  const usedSlots: { cs: string; ce: string; slot: number }[] = [];

  for (const s of periodSchedules) {
    const { cs, ce } = clampToWeek(
      s.startAt.slice(0, 10),
      s.endAt.slice(0, 10)
    );

    let slot = 0;
    while (usedSlots.some((u) => u.slot === slot && cs <= u.ce && ce >= u.cs)) {
      slot++;
    }

    usedSlots.push({ cs, ce, slot });
    slotMap.push({ ...s, slot });
  }

  for (const s of singleSchedules) {
    slotMap.push({ ...s, slot: -1 });
  }

  const result = new Map<string, SlottedSchedule[]>();
  for (const dk of weekDateKeys) {
    const forDate = slotMap
      .filter((s) => isScheduleOnDate(s, dk))
      .sort((a, b) => {
        if (a.slot !== -1 && b.slot === -1) return -1;
        if (a.slot === -1 && b.slot !== -1) return 1;
        if (a.slot !== -1 && b.slot !== -1) return a.slot - b.slot;
        return a.startAt.localeCompare(b.startAt);
      });
    result.set(dk, forDate);
  }

  return result;
}
