import { getApiClient } from './client';
import type {
  TeamSummaryResponse,
  TeamDetailResponse,
  TeamMemberResponse,
  TeamCreateRequest,
  TeamUpdateRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from '@moimi/core/types/team';

/** GET /teams/me */
export const getMyTeams = (): Promise<TeamSummaryResponse[]> =>
  getApiClient().get('/teams/me').then((res) => res.data);

/** GET /teams/{teamId} */
export const getTeamDetail = (teamId: number): Promise<TeamDetailResponse> =>
  getApiClient().get(`/teams/${teamId}`).then((res) => res.data);

/** GET /teams/{teamId}/members */
export const getTeamMembers = (teamId: number): Promise<TeamMemberResponse[]> =>
  getApiClient().get(`/teams/${teamId}/members`).then((res) => res.data);

/** POST /teams */
export const createTeam = (
  body: TeamCreateRequest
): Promise<TeamDetailResponse> =>
  getApiClient().post('/teams', body).then((res) => res.data);

/** PUT /teams/{teamId} */
export const updateTeam = (
  teamId: number,
  body: TeamUpdateRequest
): Promise<TeamDetailResponse> =>
  getApiClient().put(`/teams/${teamId}`, body).then((res) => res.data);

/** DELETE /teams/{teamId} */
export const deleteTeam = (teamId: number): Promise<void> =>
  getApiClient().delete(`/teams/${teamId}`).then((res) => res.data);

/** POST /teams/{teamId}/banner/presigned-url */
export const getPresignedUrl = (
  body: PresignedUrlRequest
): Promise<PresignedUrlResponse> =>
  getApiClient()
    .post('/teams/banner/presigned-url', body)
    .then((res) => res.data);

/** DELETE /teams/{teamId}/members/{memberId} */
export const kickMember = (teamId: number, memberId: number): Promise<void> =>
  getApiClient()
    .delete(`/teams/${teamId}/members/${memberId}`)
    .then((res) => res.data);

/** DELETE /teams/{teamId}/members/me */
export const leaveTeam = (teamId: number): Promise<void> =>
  getApiClient().delete(`/teams/${teamId}/members/me`).then((res) => res.data);

/** PATCH /teams/{teamId}/members/{memberId}/role */
export const updateMemberRole = (
  teamId: number,
  memberId: number,
  teamRole: 'LEADER' | 'MANAGER' | 'MEMBER'
): Promise<void> =>
  getApiClient()
    .patch(`/teams/${teamId}/members/${memberId}/role`, { teamRole })
    .then((res) => res.data);
