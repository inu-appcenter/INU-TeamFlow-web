import { useQuery } from '@tanstack/react-query';

import { getMyTeams, getTeamVotes } from '@/api/mypageVote';
import type { MyVote } from '@/types/mypageVote';

export const mypageVoteKeys = {
  all: () => ['mypage-votes'] as const,
  teams: () => ['mypage-votes', 'teams'] as const,
  teamVotes: (teamId: number) => ['mypage-votes', 'teams', teamId] as const,
  votes: () => ['mypage-votes', 'votes'] as const,
};

export const useMyTeams = () =>
  useQuery({
    queryKey: mypageVoteKeys.teams(),
    queryFn: getMyTeams,
  });

export const useMyVotes = () =>
  useQuery({
    queryKey: mypageVoteKeys.votes(),
    queryFn: async (): Promise<MyVote[]> => {
      const teams = await getMyTeams();

      const voteLists = await Promise.all(
        teams.map(async (team) => {
          const votes = await getTeamVotes(team.teamId);

          return votes.map((vote) => ({
            ...vote,
            teamName: team.name,
          }));
        })
      );

      return voteLists.flat();
    },
  });