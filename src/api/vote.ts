import axiosInstance from '@/lib/axiosInstance';
import type {
  EventVoteResponse,
  EventVoteCreateRequest,
  EventVoteTimeSlotResponse,
  EventVoteTimeSlotSelectRequest,
  EventVoteTimeSelectRequest,
} from '@/types/vote';

/** GET /teams/{teamId}/votes */
export const getTeamVotes = (teamId: number): Promise<EventVoteResponse[]> =>
  axiosInstance.get(`/teams/${teamId}/votes`).then((res) => res.data);

/** GET /votes/{voteId} */
export const getVoteDetail = (voteId: number): Promise<EventVoteResponse> =>
  axiosInstance.get(`/votes/${voteId}`).then((res) => res.data);

/** POST /teams/{teamId}/votes */
export const createVote = (
  teamId: number,
  body: EventVoteCreateRequest
): Promise<EventVoteResponse> =>
  axiosInstance.post(`/teams/${teamId}/votes`, body).then((res) => res.data);

/** GET /votes/{voteId}/slots */
export const getVoteSlots = (
  voteId: number
): Promise<EventVoteTimeSlotResponse[]> =>
  axiosInstance.get(`/votes/${voteId}/slots`).then((res) => res.data);

/** PUT /votes/{voteId}/slots */
export const selectVoteSlots = (
  voteId: number,
  body: EventVoteTimeSlotSelectRequest
): Promise<EventVoteTimeSlotResponse[]> =>
  axiosInstance.put(`/votes/${voteId}/slots`, body).then((res) => res.data);

/** POST /votes/{voteId}/result */
export const confirmVoteResult = (
  voteId: number,
  body: EventVoteTimeSelectRequest
): Promise<void> =>
  axiosInstance.post(`/votes/${voteId}/result`, body).then((res) => res.data);
