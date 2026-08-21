export type InvitationTab = 'RECEIVED' | 'SENT';

export type InvitationStatus = 'WAITING' | 'ACCEPTED' | 'DECLINED' | 'CANCELED';

export interface InvitationResponse {
  invitationId: number;
  teamName: string;
  status: InvitationStatus;
  senderName: string;
  receiverName: string;
  createdAt: string;
  respondedAt: string | null;
  teamCategory: string;
}

export interface UpdateInvitationStatusRequest {
  status: 'ACCEPTED' | 'DECLINED';
}

export type UpdateInvitationStatusResponse = InvitationResponse;
