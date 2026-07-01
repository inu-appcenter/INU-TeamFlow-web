export type Vote = {
  voteId: number;
  teamId: number;
  title: string;
  description: string;
  createdDate: string;
  isOpened: boolean;
  isAllDay: boolean;
  dates: string[];
  dailyTimeStart: string;
  dailyTimeEnd: string;
  completedVoterNameList: string[];
  uncompletedVoterNameList: string[];
};

export const votes: Vote[] = [
  {
    voteId: 1,
    teamId: 10,
    title: '스터디 일정 조율',
    description: '다음주 스터디 가능한 시간을 선택해주세요.',
    createdDate: '2026-05-19',
    isOpened: true,
    isAllDay: false,
    dates: ['2026-05-20', '2026-05-21', '2026-05-25'],
    dailyTimeStart: '09:00:00',
    dailyTimeEnd: '20:00:00',
    completedVoterNameList: ['홍길동', '김철수'],
    uncompletedVoterNameList: ['이영희'],
  },
  {
    voteId: 2,
    teamId: 10,
    title: '프로젝트 회의 시간 투표',
    description: '정기 회의 시간을 정하기 위한 투표입니다.',
    createdDate: '2026-06-20',
    isOpened: true,
    isAllDay: false,
    dates: ['2026-06-26', '2026-06-27'],
    dailyTimeStart: '10:00:00',
    dailyTimeEnd: '18:00:00',
    completedVoterNameList: ['김철수'],
    uncompletedVoterNameList: ['홍길동', '이영희', '박민수'],
  },
  {
    voteId: 3,
    teamId: 11,
    title: 'MT 날짜 투표',
    description: 'MT 가능한 날짜를 선택해주세요.',
    createdDate: '2026-06-10',
    isOpened: false,
    isAllDay: true,
    dates: ['2026-07-01', '2026-07-02', '2026-07-03'],
    dailyTimeStart: '00:00:00',
    dailyTimeEnd: '23:59:59',
    completedVoterNameList: ['홍길동', '김철수', '이영희'],
    uncompletedVoterNameList: [],
  },
];
