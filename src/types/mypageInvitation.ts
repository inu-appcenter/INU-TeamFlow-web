export type InvitationTab = 'RECEIVED' | 'SENT';

export type InvitationStatus =
  | 'WAITING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELED';

export interface InvitationResponse {
  invitationId: number;
  teamName: string;
  status: InvitationStatus;
  senderName: string;
  receiverName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface UpdateInvitationStatusRequest {
  status: 'ACCEPTED' | 'REJECTED';
}

export type UpdateInvitationStatusResponse = InvitationResponse;

export interface Invitation extends InvitationResponse {
  type: InvitationTab;
}