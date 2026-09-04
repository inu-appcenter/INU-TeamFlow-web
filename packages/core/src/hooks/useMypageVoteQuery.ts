import { useQuery } from '@tanstack/react-query';
import { getMyVotes } from '@moimi/core/api/mypageVote';

export const voteKeys = {
  all: ['votes'] as const,
  myVotes: () => [...voteKeys.all, 'me'] as const,
};

export const useMyVotes = () =>
  useQuery({
    queryKey: voteKeys.myVotes(),
    queryFn: getMyVotes,
    retry: (failureCount, error) => {
      const status = (
        error as {
          response?: {
            status?: number;
          };
        }
      ).response?.status;

      if (status && status >= 400 && status < 500) {
        return false;
      }

      return failureCount < 1;
    },
  });
