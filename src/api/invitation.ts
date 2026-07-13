import axiosInstance from '@/lib/axiosInstance';

import type {
  TeamInvitationResponse,
  TeamInvitationCreateRequest,
  TeamInvitationStatusUpdateRequest,
  InvitationDirection,
} from '@/types/invitation';

export const getTeamInvitations = async (
  direction: InvitationDirection,
  page = 0,
  size = 10
) => {
  const { data } = await axiosInstance.get('/teams/invitations', {
    params: { direction, page, size },
  });
  return data; // Page<TeamInvitationResponse> 형태로 감싸져 옴
};

export const createTeamInvitation = async (
  teamId: number,
  body: TeamInvitationCreateRequest
): Promise<TeamInvitationResponse> => {
  const { data } = await axiosInstance.post(
    `/teams/${teamId}/invitations`,
    body
  );
  return data;
};

export const updateInvitationStatus = async (
  invitationId: number,
  body: TeamInvitationStatusUpdateRequest
): Promise<TeamInvitationResponse> => {
  const { data } = await axiosInstance.put(
    `/teams/invitations/${invitationId}/status`,
    body
  );
  return data;
};
