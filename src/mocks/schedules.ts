export interface Schedule {
  eventId: number;
  teamId?: number;
  teamName?: string;

  title: string;
  description: string;

  occurrenceAt: string;
  startAt: string;
  endAt: string;

  isAllDay: boolean;
  color: string;

  isSingle: boolean;
  isFinished: boolean;
  isException: boolean;

  recurrence?: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    intervalValue: number;
    byDay?: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
    byMonthDay?: number;
    seriesStartAt?: string | null;
    untilAt?: string | null;
    occurrenceCount?: number | null;
  } | null;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  color: string;
  recurrence: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    intervalValue: number;
    byDay?: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
    byMonthDay?: number;
    seriesStartAt?: string | null;
    untilAt?: string | null;
    occurrenceCount?: number | null;
  } | null;
}

export const schedules: Schedule[] = [
  {
    eventId: 1,
    teamId: 1,
    teamName: '프론트팀',

    title: '메인 페이지 회의',
    description: '메인 페이지 UI 회의',

    occurrenceAt: '2026-05-10T13:00:00',
    startAt: '2026-05-10T13:00:00',
    endAt: '2026-05-12T14:00:00',

    isAllDay: false,
    color: '#F8DDFB',

    isSingle: true,
    isFinished: false,
    isException: false,

    recurrence: null,
  },

  {
    eventId: 2,
    teamId: 1,
    teamName: '기획팀',

    title: '기획 피드백',
    description: '와이어프레임 수정 회의',

    occurrenceAt: '2026-05-10T15:00:00',
    startAt: '2026-05-10T15:00:00',
    endAt: '2026-05-10T16:30:00',

    isAllDay: false,
    color: '#FFF6A8',

    isSingle: true,
    isFinished: true,
    isException: false,

    recurrence: null,
  },

  {
    eventId: 3,
    teamId: 2,
    teamName: '스터디팀',

    title: '알고리즘 스터디',
    description: 'DP 문제 풀이',

    occurrenceAt: '2026-05-10T19:00:00',
    startAt: '2026-05-10T19:00:00',
    endAt: '2026-05-10T21:00:00',

    isAllDay: false,
    color: '#D9F7BE',

    isSingle: false,
    isFinished: false,
    isException: false,

    recurrence: {
      freq: 'WEEKLY',
      intervalValue: 1,
      byDay: ['SUN'],
      seriesStartAt: '2026-05-10T19:00:00',
      untilAt: '2026-08-31T23:59:59',
      occurrenceCount: null,
    },
  },

  {
    eventId: 4,
    teamId: 3,
    teamName: '디자인팀',

    title: '피그마 수정',
    description: '캘린더 페이지 수정',

    occurrenceAt: '2026-05-10T11:00:00',
    startAt: '2026-05-10T11:00:00',
    endAt: '2026-05-10T12:00:00',

    isAllDay: false,
    color: '#CDEBFF',

    isSingle: true,
    isFinished: false,
    isException: false,

    recurrence: null,
  },

  {
    eventId: 5,
    teamId: 4,
    teamName: '백엔드팀',

    title: 'API 연결',
    description: '일정 API 테스트',

    occurrenceAt: '2026-05-10T14:00:00',
    startAt: '2026-05-10T14:00:00',
    endAt: '2026-05-10T16:00:00',

    isAllDay: false,
    color: '#FFD8D8',

    isSingle: true,
    isFinished: true,
    isException: false,

    recurrence: null,
  },

  {
    eventId: 6,
    teamId: 5,
    teamName: '운영팀',

    title: '공지 작성',
    description: '서비스 업데이트 공지',

    occurrenceAt: '2026-05-15T10:00:00',
    startAt: '2026-05-15T10:00:00',
    endAt: '2026-05-15T11:00:00',

    isAllDay: false,
    color: '#FFE7C7',

    isSingle: true,
    isFinished: false,
    isException: false,

    recurrence: null,
  },

  {
    eventId: 7,
    teamId: 6,
    teamName: '공모전팀',

    title: '발표 준비',
    description: '최종 발표 리허설',

    occurrenceAt: '2026-05-18T17:00:00',
    startAt: '2026-05-18T17:00:00',
    endAt: '2026-05-18T19:00:00',

    isAllDay: false,
    color: '#E4D7FF',

    isSingle: true,
    isFinished: false,
    isException: false,

    recurrence: null,
  },

  {
    eventId: 8,
    teamId: 7,
    teamName: '동아리',

    title: '정기 모임',
    description: '5월 정기 회의',

    occurrenceAt: '2026-05-22T18:30:00',
    startAt: '2026-05-22T18:30:00',
    endAt: '2026-05-22T20:00:00',

    isAllDay: false,
    color: '#D7F5F0',

    isSingle: false,
    isFinished: true,
    isException: false,

    recurrence: {
      freq: 'MONTHLY',
      intervalValue: 1,
      byMonthDay: 22,
      seriesStartAt: '2026-05-22T18:30:00',
      untilAt: null,
      occurrenceCount: 12,
    },
  },
];
