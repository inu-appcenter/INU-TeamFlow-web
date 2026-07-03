import axiosInstance from '@/lib/axiosInstance';
import type { MyTeamResponse, MyVoteResponse } from '@/types/mypageVote';

/** GET /teams/me */
export const getMyTeams = (): Promise<MyTeamResponse[]> =>
  axiosInstance.get('/teams/me').then((res) => res.data);

/** GET /teams/{teamId}/votes */
export const getTeamVotes = (teamId: number): Promise<MyVoteResponse[]> =>
  axiosInstance.get(`/teams/${teamId}/votes`).then((res) => res.data);