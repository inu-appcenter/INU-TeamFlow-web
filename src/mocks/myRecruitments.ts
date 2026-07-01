export type MyPostType = 'ALL' | 'RECRUIT' | 'INFO' | 'APPLY' | 'NOTICE';

export type RecruitmentCategory = 'CONTEST' | 'PROJECT' | 'STUDY' | 'CLUB';

export type MyRecruitment = {
  recruitmentId: number;
  title: string;
  isOpened: boolean;
  category: RecruitmentCategory;
  recruiterName: string;
  createdAt: string;
  endAt: string;
  type: Exclude<MyPostType, 'ALL' | 'APPLY'>;
};

export const myRecruitments: MyRecruitment[] = [
  {
    recruitmentId: 1,
    title: '2026 앱 개발 공모전 팀원 모집',
    isOpened: true,
    category: 'CONTEST',
    recruiterName: '홍길동',
    createdAt: '2026-06-25T04:47:44.474Z',
    endAt: '2026-07-10T23:59:00.000Z',
    type: 'RECRUIT',
  },
  {
    recruitmentId: 2,
    title: 'TEAM FLOW 프론트엔드 프로젝트 모집',
    isOpened: true,
    category: 'PROJECT',
    recruiterName: '김민수',
    createdAt: '2026-06-20T10:20:00.000Z',
    endAt: '2026-07-01T23:59:00.000Z',
    type: 'RECRUIT',
  },
  {
    recruitmentId: 3,
    title: 'React 스터디 정보 공유',
    isOpened: true,
    category: 'STUDY',
    recruiterName: '이서연',
    createdAt: '2026-06-18T08:30:00.000Z',
    endAt: '2026-06-30T23:59:00.000Z',
    type: 'INFO',
  },
  {
    recruitmentId: 4,
    title: '프로젝트 회의 일정 공지',
    isOpened: false,
    category: 'PROJECT',
    recruiterName: '박지훈',
    createdAt: '2026-06-15T12:00:00.000Z',
    endAt: '2026-06-22T23:59:00.000Z',
    type: 'NOTICE',
  },
  {
    recruitmentId: 5,
    title: '교내 해커톤 팀원 모집',
    isOpened: false,
    category: 'CONTEST',
    recruiterName: '최유진',
    createdAt: '2026-06-10T09:00:00.000Z',
    endAt: '2026-06-19T23:59:00.000Z',
    type: 'RECRUIT',
  },
];
