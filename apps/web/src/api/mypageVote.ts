import axiosInstance from '@/lib/axiosInstance';
import type { MyVote } from '@/types/mypageVote';

/** GET /votes/me */
export const getMyVotes = async (): Promise<MyVote[]> => {
  const response = await axiosInstance.get<MyVote[]>('/votes/me');

  return response.data;
};
