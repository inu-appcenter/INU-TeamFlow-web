import { getApiClient } from './client';
import type {
  InvitationResponse,
  InvitationTab,
  UpdateInvitationStatusRequest,
  UpdateInvitationStatusResponse,
} from '@moimi/core/types/mypageInvitation';

interface PageableParams {
  page?: number;
  size?: number;
  sort?: string[];
}

const getList = <T>(data: T[] | { content?: T[] } | T): T[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null && 'content' in data) {
    return data.content ?? [];
  }
  return [data as T];
};

/** GET /teams/invitations */
export const getInvitations = async (
  direction: InvitationTab,
  params: PageableParams = { page: 0, size: 20 }
): Promise<InvitationResponse[]> => {
  const res = await getApiClient().get('/teams/invitations', {
    params: {
      direction,
      ...params,
    },
  });

  return getList<InvitationResponse>(res.data);
};

/** PUT /teams/invitations/{invitationId}/status */
export const updateInvitationStatus = (
  invitationId: number,
  body: UpdateInvitationStatusRequest
): Promise<UpdateInvitationStatusResponse> =>
  getApiClient()
    .put(`/teams/invitations/${invitationId}/status`, body)
    .then((res) => res.data);