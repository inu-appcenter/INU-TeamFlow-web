export type InviteStatus = 'WAITING' | 'ACCEPTED' | 'DECLINED';
export type InvitationDirection = 'RECEIVED' | 'SENT';

export interface TeamInvitationResponse {
  invitationId: number;
  teamName: string;
  status: InviteStatus;
  senderName: string;
  receiverName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface TeamInvitationCreateRequest {
  studentNumber: string;
}

export interface TeamInvitationStatusUpdateRequest {
  status: InviteStatus;
}
