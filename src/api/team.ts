import axiosInstance from '@/lib/axiosInstance';
import type {
  TeamSummaryResponse,
  TeamDetailResponse,
  TeamMemberResponse,
  TeamCreateRequest,
  TeamUpdateRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from '@/types/team';

/** GET /teams/me */
export const getMyTeams = (): Promise<TeamSummaryResponse[]> =>
  axiosInstance.get('/teams/me').then((res) => res.data);

/** GET /teams/{teamId} */
export const getTeamDetail = (teamId: number): Promise<TeamDetailResponse> =>
  axiosInstance.get(`/teams/${teamId}`).then((res) => res.data);

/** GET /teams/{teamId}/members */
export const getTeamMembers = (teamId: number): Promise<TeamMemberResponse[]> =>
  axiosInstance.get(`/teams/${teamId}/members`).then((res) => res.data);

/** POST /teams */
export const createTeam = (
  body: TeamCreateRequest
): Promise<TeamDetailResponse> =>
  axiosInstance.post('/teams', body).then((res) => res.data);

/** PUT /teams/{teamId} */
export const updateTeam = (
  teamId: number,
  body: TeamUpdateRequest
): Promise<TeamDetailResponse> =>
  axiosInstance.put(`/teams/${teamId}`, body).then((res) => res.data);

/** DELETE /teams/{teamId} */
export const deleteTeam = (teamId: number): Promise<void> =>
  axiosInstance.delete(`/teams/${teamId}`).then((res) => res.data);

/** POST /teams/{teamId}/banner/presigned-url */
export const getPresignedUrl = (
  body: PresignedUrlRequest
): Promise<PresignedUrlResponse> =>
  axiosInstance
    .post('/teams/banner/presigned-url', body)
    .then((res) => res.data);

/** DELETE /teams/{teamId}/members/{memberId} */
export const kickMember = (teamId: number, memberId: number): Promise<void> =>
  axiosInstance
    .delete(`/teams/${teamId}/members/${memberId}`)
    .then((res) => res.data);

/** DELETE /teams/{teamId}/members/me */
export const leaveTeam = (teamId: number): Promise<void> =>
  axiosInstance.delete(`/teams/${teamId}/members/me`).then((res) => res.data);
