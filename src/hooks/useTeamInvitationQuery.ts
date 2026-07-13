import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTeamInvitations,
  createTeamInvitation,
  updateInvitationStatus,
} from '@/api/invitation';
import type {
  TeamInvitationCreateRequest,
  TeamInvitationStatusUpdateRequest,
  InvitationDirection,
} from '@/types/invitation';
import { teamKeys } from '@/hooks/useTeamQuery';

export const invitationKeys = {
  all: () => ['invitations'] as const,
  list: (direction: InvitationDirection) => ['invitations', direction] as const,
};

export const useTeamInvitations = (
  direction: InvitationDirection,
  page = 0,
  size = 10
) =>
  useQuery({
    queryKey: [...invitationKeys.list(direction), page, size],
    queryFn: () => getTeamInvitations(direction, page, size),
  });

export const useCreateInvitation = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TeamInvitationCreateRequest) =>
      createTeamInvitation(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all() });
    },
  });
};

export const useUpdateInvitationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitationId,
      body,
    }: {
      invitationId: number;
      body: TeamInvitationStatusUpdateRequest;
    }) => updateInvitationStatus(invitationId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all() });

      // teamId를 응답에서 못 받아서 특정 팀만 정확히 invalidate 불가
      // 백엔드에 TeamInvitationResponse.teamId 추가 요청 필요
      if (variables.body.status === 'ACCEPTED') {
        queryClient.invalidateQueries({ queryKey: ['teams'] });
      }
    },
  });
};
