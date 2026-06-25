export type TeamCategory = 'CONTEST' | 'STUDY' | 'PROJECT' | 'CLUB' | 'ETC';

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface CreateTeamRequest {
  name: string;
  category: TeamCategory;

  description: string;

  link: string;
  sns: string;

  imageKey: string;
}

export interface Team {
  teamId: number;

  name: string;
  category: TeamCategory;

  memberCount: number;

  description: string;

  imageUrl: string;
}

export interface TeamDetail {
  teamId: number;

  name: string;
  category: TeamCategory;

  description: string;

  memberCount: number;

  role: TeamRole;

  link: string;
  sns: string;

  imageUrl: string;

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
    name: '가나디공모전팀',
    category: 'CONTEST',
    memberCount: 23,
    description: '캡스톤 및 공모전을 준비하는 팀입니다.',
    imageUrl: '',
  },
  {
    teamId: 2,
    name: '알고리즘 스터디',
    category: 'STUDY',
    memberCount: 12,
    description:
      '주 2회 알고리즘 문제 풀이를 진행합니다. 그래서 어쩌구저쩌구 열심히어쩌구으싸쟈으쌰',
    imageUrl: '',
  },
  {
    teamId: 3,
    name: '동아리어쩌구',
    category: 'CLUB',
    memberCount: 8,
    description: '연극 공연을 준비하는 동아리입니다.',
    imageUrl: '',
  },
  {
    teamId: 4,
    name: '캡스톤 프로젝트',
    category: 'PROJECT',
    memberCount: 5,
    description: '캡스톤 프로젝트 개발 팀입니다.',
    imageUrl: '',
  },
];

export const teamDetails: TeamDetail[] = [
  {
    teamId: 1,
    name: '가나디공모전팀',
    category: 'CONTEST',

    description: '캡스톤 및 공모전을 준비하는 팀입니다.',

    memberCount: 23,

    role: 'OWNER',

    link: 'https://teamflow.com',
    sns: 'https://instagram.com/teamflow',

    imageUrl: '',

    joinedAt: '2026-03-01T00:00:00',
    createdAt: '2026-02-10T00:00:00',
    updatedAt: '2026-05-19T00:00:00',
  },

  {
    teamId: 2,
    name: '알고리즘 스터디',
    category: 'STUDY',

    description:
      '주 2회 알고리즘 문제 풀이를 진행합니다. 그래서 어쩌구저쩌구 열심히어쩌구으싸쟈으쌰',

    memberCount: 12,

    role: 'MEMBER',

    link: '',
    sns: '',

    imageUrl: '',

    joinedAt: '2026-04-12T00:00:00',
    createdAt: '2026-03-28T00:00:00',
    updatedAt: '2026-05-11T00:00:00',
  },

  {
    teamId: 3,
    name: '동아리어쩌구',
    category: 'CLUB',

    description: '연극 공연을 준비하는 동아리입니다.',

    memberCount: 8,

    role: 'ADMIN',

    link: '',
    sns: 'https://instagram.com/inin_theater',

    imageUrl: '',

    joinedAt: '2026-01-15T00:00:00',
    createdAt: '2025-12-20T00:00:00',
    updatedAt: '2026-05-01T00:00:00',
  },
];
