import { getApiClient } from './client';
import type {
  EventVoteResponse,
  EventVoteCreateRequest,
  EventVoteTimeSlotResponse,
  EventVoteTimeSlotSelectRequest,
  EventVoteTimeSelectRequest,
} from '@moimi/core/types/vote';

/** GET /teams/{teamId}/votes */
export const getTeamVotes = (teamId: number): Promise<EventVoteResponse[]> =>
  getApiClient().get(`/teams/${teamId}/votes`).then((res) => res.data);

/** GET /votes/{voteId} */
export const getVoteDetail = (voteId: number): Promise<EventVoteResponse> =>
  getApiClient().get(`/votes/${voteId}`).then((res) => res.data);

/** POST /teams/{teamId}/votes */
export const createVote = (
  teamId: number,
  body: EventVoteCreateRequest
): Promise<EventVoteResponse> =>
  getApiClient().post(`/teams/${teamId}/votes`, body).then((res) => res.data);

/** GET /votes/{voteId}/slots */
export const getVoteSlots = (
  voteId: number
): Promise<EventVoteTimeSlotResponse[]> =>
  getApiClient().get(`/votes/${voteId}/slots`).then((res) => res.data);

/** PUT /votes/{voteId}/slots */
export const selectVoteSlots = (
  voteId: number,
  body: EventVoteTimeSlotSelectRequest
): Promise<EventVoteTimeSlotResponse[]> =>
  getApiClient().put(`/votes/${voteId}/slots`, body).then((res) => res.data);

/** POST /votes/{voteId}/result */
export const confirmVoteResult = (
  voteId: number,
  body: EventVoteTimeSelectRequest
): Promise<void> =>
  getApiClient().post(`/votes/${voteId}/result`, body).then((res) => res.data);

/** DELETE */
export const deleteVote = async (voteId: number): Promise<void> => {
  await getApiClient().delete(`/votes/${voteId}`);
};
