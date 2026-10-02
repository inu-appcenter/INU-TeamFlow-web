import { getApiClient } from './client';
import type {
  Schedule,
  EventListResponse,
  EventDetailResponse,
  MyEventCreateRequest,
  MyEventUpdateRequest,
  TeamEventCreateRequest,
  TeamEventUpdateRequest,
} from '@moimi/core/types/event';

// 개인 일정

/** GET /events?year=...&month=...  */
export const getMyEvents = (year: number, month: number): Promise<Schedule[]> =>
  getApiClient()
    .get('/events', { params: { year, month } })
    .then((res) => res.data);

/** POST /events */
export const createMyEvent = (
  body: MyEventCreateRequest
): Promise<EventDetailResponse> =>
  getApiClient().post('/events', body).then((res) => res.data);

/** PUT /events/{eventId} */
export const updateMyEvent = (
  eventId: number,
  body: MyEventUpdateRequest
): Promise<EventDetailResponse> =>
  getApiClient().put(`/events/${eventId}`, body).then((res) => res.data);

/** DELETE /events/{eventId}?scope=...&occurrence=... */
export const deleteMyEvent = (
  eventId: number,
  scope: string,
  occurrence: string
): Promise<void> =>
  getApiClient()
    .delete(`/events/${eventId}`, { params: { scope, occurrence } })
    .then((res) => res.data);

// 팀 일정

/** GET /teams/{teamId}/events?year=...&month=... */
export const getTeamEvents = (
  teamId: number,
  year: number,
  month: number
): Promise<Schedule[]> =>
  getApiClient()
    .get(`/teams/${teamId}/events`, { params: { year, month } })
    .then((res) => res.data);

/** POST /teams/{teamId}/events */
export const createTeamEvent = (
  teamId: number,
  body: TeamEventCreateRequest
): Promise<EventDetailResponse> =>
  getApiClient().post(`/teams/${teamId}/events`, body).then((res) => res.data);

/** PUT /teams/{teamId}/events/{eventId} */
export const updateTeamEvent = (
  teamId: number,
  eventId: number,
  body: TeamEventUpdateRequest
): Promise<EventDetailResponse> =>
  getApiClient()
    .put(`/teams/${teamId}/events/${eventId}`, body)
    .then((res) => res.data);

/** DELETE /teams/{teamId}/events/{eventId}?scope=...&occurrence=... */
export const deleteTeamEvent = (
  teamId: number,
  eventId: number,
  scope: string,
  occurrence: string
): Promise<void> =>
  getApiClient()
    .delete(`/teams/${teamId}/events/${eventId}`, {
      params: { scope, occurrence },
    })
    .then((res) => res.data);
