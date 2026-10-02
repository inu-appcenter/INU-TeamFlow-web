export const SCHEDULE_COLORS = [
  'SUN',
  'BLOSSOM',
  'OCEAN',
  'LEAF',
  'ROSE',
  'PEACH',
  'LAVENDER',
  'MINT',
] as const;

export type ScheduleColor = (typeof SCHEDULE_COLORS)[number];

export const EVENT_COLOR_MAP: Record<ScheduleColor, string> = {
  SUN: '#FFF3B0',
  BLOSSOM: '#F8DDFB',
  OCEAN: '#CDEBFF',
  LEAF: '#D9F7BE',
  ROSE: '#FFD8D8',
  PEACH: '#FFE7C7',
  LAVENDER: '#E4D7FF',
  MINT: '#D7F5F0',
};

export type { ScheduleColor as EventColor } from './scheduleColor';
