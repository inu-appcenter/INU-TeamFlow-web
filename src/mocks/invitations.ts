export type InvitationStatus = 'WAITING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
export type InvitationTab = 'RECEIVED' | 'SENT';

export type Invitation = {
  invitationId: number;
  teamName: string;
  status: InvitationStatus;
  senderName: string;
  receiverName: string;
  createdAt: string;
  respondedAt: string | null;
  type: InvitationTab;
};

export const invitations: Invitation[] = [
  {
    invitationId: 1,
    teamName: 'TEAM FLOW',
    status: 'WAITING',
    senderName: '홍길동',
    receiverName: '김철수',
    createdAt: '2026-06-25T05:23:19.650Z',
    respondedAt: null,
    type: 'RECEIVED',
  },
  {
    invitationId: 2,
    teamName: '앱센터 프로젝트',
    status: 'ACCEPTED',
    senderName: '김철수',
    receiverName: '이영희',
    createdAt: '2026-06-23T05:23:19.650Z',
    respondedAt: '2026-06-24T05:23:19.650Z',
    type: 'SENT',
  },
  {
    invitationId: 3,
    teamName: '교내 해커톤 팀',
    status: 'REJECTED',
    senderName: '박민수',
    receiverName: '김철수',
    createdAt: '2026-06-20T11:10:00.000Z',
    respondedAt: '2026-06-21T09:30:00.000Z',
    type: 'RECEIVED',
  },
  {
    invitationId: 4,
    teamName: 'React 스터디',
    status: 'WAITING',
    senderName: '김철수',
    receiverName: '최유진',
    createdAt: '2026-06-18T13:20:00.000Z',
    respondedAt: null,
    type: 'SENT',
  },
  {
    invitationId: 5,
    teamName: 'TEAM FLOW',
    status: 'WAITING',
    senderName: '길동',
    receiverName: '철수',
    createdAt: '2026-06-25T05:23:19.650Z',
    respondedAt: null,
    type: 'RECEIVED',
  },
  {
    invitationId: 6,
    teamName: '앱센터 프로젝트',
    status: 'ACCEPTED',
    senderName: '김수',
    receiverName: '영희',
    createdAt: '2026-06-23T05:23:19.650Z',
    respondedAt: '2026-06-24T05:23:19.650Z',
    type: 'SENT',
  },
  {
    invitationId: 7,
    teamName: '교내 해커톤 팀',
    status: 'REJECTED',
    senderName: '민수',
    receiverName: '철수',
    createdAt: '2026-06-20T11:10:00.000Z',
    respondedAt: '2026-06-21T09:30:00.000Z',
    type: 'RECEIVED',
  },
  {
    invitationId: 8,
    teamName: 'React 스터디',
    status: 'WAITING',
    senderName: '철수',
    receiverName: '유진',
    createdAt: '2026-06-18T13:20:00.000Z',
    respondedAt: null,
    type: 'SENT',
  },
];
