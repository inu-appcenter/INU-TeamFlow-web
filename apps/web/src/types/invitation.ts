export type InviteStatus = 'WAITING' | 'ACCEPTED' | 'DECLINED';
export type InvitationDirection = 'RECEIVED' | 'SENT';

// 팀원 검색/초대 후보 목록에서의 관계 상태
export type InvitationCandidateStatus = 'PENDING' | 'NONE' | 'MEMBER';

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
