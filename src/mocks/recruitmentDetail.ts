export interface RecruitmentDetail {
  recruitmentId: number;
  title: string;
  status: string;
  category: string;
  description: string;
  targetMemberCount: number;
  currentMemberCount: number;
  announcementId: number;
  announcementTitle: string;
  teamId: number;
  teamName: string;
  endAt: string;
  recruiterId: number;
  recruiterName: string;
  isRecruiter: boolean;
  hasApplied: boolean;
  createdAt: string;
  updatedAt: string;
}
export const recruitmentDetails = [
  {
    recruitmentId: 1,
    title: '과외를 모집합니다',
    status: 'OPEN',
    category: 'STUDY',
    description:
      'React 과외를 진행할 예정입니다.\n\n기초부터 차근차근 진행합니다.',
    targetMemberCount: 3,
    currentMemberCount: 1,
    announcementId: 1,
    announcementTitle: '모집글1',
    teamId: 1,
    teamName: '스터디팀',
    endAt: '2026-06-10',
    recruiterId: 1,
    recruiterName: '홍길동',
    isRecruiter: false,
    hasApplied: false,
    createdAt: '2026-03-08',
    updatedAt: '2026-03-08',
  },

  {
    recruitmentId: 2,
    title: '프로젝트 팀원을 모집합니다',
    status: 'OPEN',
    category: 'PROJECT',

    description:
      'TeamFlow 프론트엔드 개발 팀원을 모집합니다.\n\nNext.js + Tailwind 사용 예정입니다.',

    targetMemberCount: 5,
    currentMemberCount: 3,

    announcementId: 2,
    announcementTitle: '',

    teamId: 2,
    teamName: 'TeamFlow',

    endAt: '2026-06-10',

    recruiterId: 2,
    recruiterName: '김민수',

    isRecruiter: false,
    hasApplied: true,

    createdAt: '2026-03-08',
    updatedAt: '2026-03-08',
  },

  {
    recruitmentId: 3,
    title: '동아리 부원을 모집합니다',
    status: 'CLOSED',
    category: 'CLUB',

    description: '동아리 신입 부원을 모집합니다.\n\n매주 정기 모임이 있습니다.',

    targetMemberCount: 10,
    currentMemberCount: 10,

    announcementId: 3,
    announcementTitle: '신입 부원 모집 안내',

    teamId: 3,
    teamName: 'INU BAND',

    endAt: '2026-03-10',

    recruiterId: 3,
    recruiterName: '이서연',

    isRecruiter: false,
    hasApplied: false,

    createdAt: '2026-03-08',
    updatedAt: '2026-03-08',
  },
];
