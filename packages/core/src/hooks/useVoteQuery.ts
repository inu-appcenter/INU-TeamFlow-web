import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTeamVotes,
  getVoteDetail,
  createVote,
  getVoteSlots,
  selectVoteSlots,
  deleteVote,
  confirmVoteResult,
} from '@moimi/core/api/vote';
import type {
  EventVoteCreateRequest,
  EventVoteTimeSlotSelectRequest,
  EventVoteTimeSelectRequest,
} from '@moimi/core/types/vote';

export const voteKeys = {
  teamVotes: (teamId: number) => ['votes', teamId] as const,
  voteDetail: (voteId: number) => ['votes', 'detail', voteId] as const,
  voteSlots: (voteId: number) => ['votes', 'slots', voteId] as const,
};

export const useTeamVotes = (teamId: number) =>
  useQuery({
    queryKey: voteKeys.teamVotes(teamId),
    queryFn: () => getTeamVotes(teamId),
  });

export const useVoteDetail = (voteId: number) =>
  useQuery({
    queryKey: voteKeys.voteDetail(voteId),
    queryFn: () => getVoteDetail(voteId),
  });

export const useVoteSlots = (voteId: number) =>
  useQuery({
    queryKey: voteKeys.voteSlots(voteId),
    queryFn: () => getVoteSlots(voteId),
  });

export const useCreateVote = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: EventVoteCreateRequest) => createVote(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
};

export const useSelectVoteSlots = (voteId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: EventVoteTimeSlotSelectRequest) =>
      selectVoteSlots(voteId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voteKeys.voteSlots(voteId) });
      queryClient.invalidateQueries({ queryKey: voteKeys.voteDetail(voteId) });
    },
  });
};

export const useConfirmVoteResult = (voteId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: EventVoteTimeSelectRequest) =>
      confirmVoteResult(voteId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
};

export const useDeleteVote = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voteId: number) => deleteVote(voteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voteKeys.teamVotes(teamId) });
    },
  });
};
