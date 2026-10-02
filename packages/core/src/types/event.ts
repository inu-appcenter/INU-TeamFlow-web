import type { TeamRole } from '../constants/teamEnum';

export type EventColor =
  | 'SUN'
  | 'BLOSSOM'
  | 'OCEAN'
  | 'LEAF'
  | 'ROSE'
  | 'PEACH'
  | 'LAVENDER'
  | 'MINT';

export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type RecurrenceEditScope =
  | 'THIS_INSTANCE'
  | 'THIS_AND_FOLLOWING'
  | 'ALL_SERIES';

export interface EventParticipant {
  userId: number;
  teamMemberId: number;
  name: string;
  teamRole: TeamRole;
}

// Recurrence

export interface Recurrence {
  freq: RecurrenceFreq;
  intervalValue: number;
  byDay: string[] | null;
  byMonthDay: number | null;
  seriesStartAt: string | null;
  untilAt: string | null;
  occurrenceCount: number | null;
}

// Response

export interface EventListResponse {
  eventId: number;
  teamId: number | null;
  teamName: string | null;
  title: string;
  description: string;
  occurrenceAt: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  color: EventColor;
  isSingle: boolean;
  isFinished: boolean;
  isException: boolean;
  isParticipant: boolean;
  participants: EventParticipant[];
  recurrence: Recurrence | null;
}

export type EventDetailResponse = EventListResponse;

// Request

export interface MyEventCreateRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  color: EventColor;
  recurrence?: Recurrence;
}

export interface MyEventUpdateRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  color: EventColor;
  isFinished: boolean;
  recurrenceEditScope?: RecurrenceEditScope;
  occurrenceAt?: string;
  recurrence?: Recurrence;
}

export interface TeamEventCreateRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  color: EventColor;
  participants: number[];
  recurrence?: Recurrence;
}

export interface TeamEventUpdateRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  color: EventColor;
  isFinished: boolean;
  recurrenceEditScope?: RecurrenceEditScope;
  occurrenceAt?: string;
  participants: number[];
  recurrence?: Recurrence;
}

export type Schedule = EventListResponse;
