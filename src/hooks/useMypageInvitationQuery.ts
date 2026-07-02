import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getInvitations,
  updateInvitationStatus,
} from '@/api/mypageInvitation';
import type {
  InvitationTab,
  UpdateInvitationStatusRequest,
} from '@/types/mypageInvitation';

export const mypageInvitationKeys = {
  all: () => ['mypage-invitations'] as const,
  list: (direction: InvitationTab) =>
    ['mypage-invitations', direction] as const,
};

export const useInvitations = (direction: InvitationTab) =>
  useQuery({
    queryKey: mypageInvitationKeys.list(direction),
    queryFn: () => getInvitations(direction),
  });

export const useUpdateInvitationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      body,
    }: {
      invitationId: number;
      body: UpdateInvitationStatusRequest;
    }) => updateInvitationStatus(invitationId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mypageInvitationKeys.all(),
      });
    },
  });
};