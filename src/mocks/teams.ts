export interface Team {
  teamId: number;
  name: string;
  category: 'CONTEST' | 'STUDY' | 'PROJECT' | 'CLUB' | 'ETC';

  memberCount: number;

  description: string;

  imageUrl: string;
}

export interface TeamDetail extends Team {
  role: 'OWNER' | 'ADMIN' | 'MEMBER';

  link: string;
  sns: string;

  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvitation {
  invitationId: number;
  teamName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  senderName: string;
  receiverName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface CreateTeamInvitationRequest {
  studentNumber: string;
}

export const teams: Team[] = [
  {
    teamId: 1,
    name: '팀명 1',
    category: 'CONTEST',
    memberCount: 23,
    description: '어쩌구저쩌구살라살라',
    imageUrl: '',
  },
  {
    teamId: 2,
    name: '팀명 2',
    category: 'STUDY',
    memberCount: 12,
    description: '스터디 팀입니다',
    imageUrl: '',
  },
  {
    teamId: 3,
    name: '팀명 3',
    category: 'CLUB',
    memberCount: 8,
    description: '동아리 팀입니다',
    imageUrl: '',
  },
  {
    teamId: 4,
    name: '팀명 4',
    category: 'PROJECT',
    memberCount: 5,
    description: '프로젝트 팀입니다',
    imageUrl: '',
  },
];

export const teamDetails: TeamDetail[] = [
  {
    teamId: 1,
    name: '팀명 1',
    category: 'CONTEST',

    memberCount: 23,

    description: '어쩌구저쩌구살라살라',

    imageUrl: '',

    role: 'OWNER',

    link: 'https://teamflow.com',
    sns: '@teamflow',

    joinedAt: '2026-03-01',
    createdAt: '2026-02-10',
    updatedAt: '2026-05-19',
  },

  {
    teamId: 2,
    name: '팀명 2',
    category: 'STUDY',

    memberCount: 12,

    description: '스터디 팀입니다',

    imageUrl: '',

    role: 'MEMBER',

    link: '',
    sns: '',

    joinedAt: '2026-04-12',
    createdAt: '2026-03-28',
    updatedAt: '2026-05-11',
  },
];
