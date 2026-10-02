import { getApiClient } from './client';

import type {
  TeamInvitationResponse,
  TeamInvitationCreateRequest,
  TeamInvitationStatusUpdateRequest,
  InvitationDirection,
} from '@moimi/core/types/invitation';
import type { UserSearchResponse } from '@moimi/core/types/user';

export const getTeamInvitations = async (
  direction: InvitationDirection,
  page = 0,
  size = 10
) => {
  const { data } = await getApiClient().get('/teams/invitations', {
    params: { direction, page, size },
  });
  return data; // Page<TeamInvitationResponse> 형태로 감싸져 옴
};

export const createTeamInvitation = async (
  teamId: number,
  body: TeamInvitationCreateRequest
): Promise<TeamInvitationResponse> => {
  const { data } = await getApiClient().post(
    `/teams/${teamId}/invitations`,
    body
  );
  return data;
};

export const updateInvitationStatus = async (
  invitationId: number,
  body: TeamInvitationStatusUpdateRequest
): Promise<TeamInvitationResponse> => {
  const { data } = await getApiClient().put(
    `/teams/invitations/${invitationId}/status`,
    body
  );
  return data;
};

/** GET /teams/{teamId}/invitations/candidates */
export const searchInvitationCandidates = async (
  teamId: number,
  name: string
): Promise<UserSearchResponse[]> => {
  const { data } = await getApiClient().get<UserSearchResponse[]>(
    `/teams/${teamId}/invitations/candidates`,
    { params: { name } }
  );
  return data;
};
