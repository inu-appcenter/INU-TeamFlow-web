export const scheduleColors = [
  '#FFF3B0',
  '#F8DDFB',
  '#CDEBFF',
  '#D9F7BE',
  '#FFD8D8',
  '#FFE7C7',
  '#E4D7FF',
  '#D7F5F0',
] as const;

export type ScheduleColor = (typeof scheduleColors)[number];
