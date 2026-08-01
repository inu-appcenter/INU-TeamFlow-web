// 반복 일정(recurrence)의 요일을 나타내는 타입 — 백엔드 ByDay 스펙과 동일
export type ByDay =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

// JS Date.getDay() 반환값(0~6, 일~토) → ByDay 문자열로 변환할 때 사용
export const DAY_NUMBER_TO_BY_DAY: Record<number, ByDay> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

// 반대 방향 변환 — ByDay 문자열 → 숫자(0~6)
export const BY_DAY_TO_DAY_NUMBER: Record<ByDay, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};
