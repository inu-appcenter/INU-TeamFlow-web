import { getApiClient } from './client';
import type { MyVote } from '@moimi/core/types/mypageVote';

/** GET /votes/me */
export const getMyVotes = async (): Promise<MyVote[]> => {
  const response = await getApiClient().get<MyVote[]>('/votes/me');

  return response.data;
};
