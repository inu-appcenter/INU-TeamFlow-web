export interface Vote {
  voteId: number;
  teamId: number;

  title: string;
  description: string;

  isOpened: boolean;
  isAllDay: boolean;

  createdDate: string;
  dates: string[];

  dailyTimeStart: string | null;
  dailyTimeEnd: string | null;

  completedVoterNameList: string[];
  uncompletedVoterNameList: string[];
}

export interface EventVoteTimeSlotSelectRequest {
  slotIdList: number[];
}

export interface EventVoteTimeSlotResponse {
  slotId: number;

  date: string;
  startAt: string;
  endAt: string;

  participantCount: number;
}

export interface MockEventVoteTimeSlotResponse extends EventVoteTimeSlotResponse {
  voteId: number;
}

export const votes: Vote[] = [
  {
    voteId: 1,
    teamId: 1,

    title: '5월 정기 회의 시간 투표',
    description: '5월 정기 회의 가능한 시간을 선택해주세요.',

    isOpened: true,
    isAllDay: false,

    createdDate: '2026-05-21',
    dates: ['2026-05-22', '2026-05-23', '2026-05-24', '2026-05-26'],

    dailyTimeStart: '09:00',
    dailyTimeEnd: '22:00',

    completedVoterNameList: ['닉네임1', '닉네임134', '닉네임12455'],
    uncompletedVoterNameList: ['닉네임', '어쩌구저쩌구나어라널'],
  },

  {
    voteId: 2,
    teamId: 1,

    title: '프로젝트 발표 준비 일정 투표',
    description: '발표 자료 제작 및 리허설 가능한 날짜를 투표해주세요.',

    isOpened: true,
    isAllDay: true,

    createdDate: '2026-05-18',
    dates: ['2026-05-25', '2026-05-26', '2026-05-27'],

    dailyTimeStart: null,
    dailyTimeEnd: null,

    completedVoterNameList: ['닉네임1', '닉네임134'],
    uncompletedVoterNameList: ['닉네임12455', '닉네임', '어쩌구저쩌구나어라널'],
  },

  {
    voteId: 3,
    teamId: 1,

    title: '최종 회의 일정 투표',
    description: '최종 제출 전 회의 일정을 정하기 위한 투표입니다.',

    isOpened: false,
    isAllDay: false,

    createdDate: '2026-05-10',
    dates: ['2026-05-15', '2026-05-16'],

    dailyTimeStart: '10:00',
    dailyTimeEnd: '18:00',

    completedVoterNameList: ['닉네임1', '닉네임134', '닉네임12455', '닉네임'],
    uncompletedVoterNameList: [],
  },

  {
    voteId: 4,
    teamId: 2,

    title: '스터디 가능 요일 투표',
    description: '매주 스터디를 진행할 수 있는 요일을 선택해주세요.',

    isOpened: true,
    isAllDay: true,

    createdDate: '2026-05-20',
    dates: ['2026-05-27', '2026-05-28'],

    dailyTimeStart: null,
    dailyTimeEnd: null,

    completedVoterNameList: ['김철수', '홍길동'],
    uncompletedVoterNameList: ['이영희'],
  },

  {
    voteId: 5,
    teamId: 2,

    title: '모의 발표 시간 투표',
    description: '모의 발표를 진행할 시간대를 선택해주세요.',

    isOpened: false,
    isAllDay: false,

    createdDate: '2026-05-12',
    dates: ['2026-05-19'],

    dailyTimeStart: '13:00',
    dailyTimeEnd: '20:00',

    completedVoterNameList: ['김철수', '홍길동', '이영희'],
    uncompletedVoterNameList: [],
  },

  {
    voteId: 6,
    teamId: 1,

    title: '최종 회의 일정 투표',
    description: '최종 제출 전 회의 일정을 정하기 위한 투표입니다.',

    isOpened: false,
    isAllDay: false,

    createdDate: '2026-05-01',
    dates: ['2026-05-03', '2026-05-04'],

    dailyTimeStart: '10:00',
    dailyTimeEnd: '18:00',

    completedVoterNameList: ['닉네임1', '닉네임134', '닉네임12455', '닉네임'],
    uncompletedVoterNameList: [],
  },
];

export const eventVoteTimeSlots: MockEventVoteTimeSlotResponse[] = [
  {
    voteId: 1,
    slotId: 1,
    date: '2026-05-22',
    startAt: '09:00',
    endAt: '10:00',
    participantCount: 1,
  },
  {
    voteId: 1,
    slotId: 2,
    date: '2026-05-22',
    startAt: '10:00',
    endAt: '11:00',
    participantCount: 2,
  },
  {
    voteId: 1,
    slotId: 3,
    date: '2026-05-22',
    startAt: '11:00',
    endAt: '12:00',
    participantCount: 2,
  },
  {
    voteId: 1,
    slotId: 4,
    date: '2026-05-23',
    startAt: '11:00',
    endAt: '12:00',
    participantCount: 1,
  },
  {
    voteId: 1,
    slotId: 5,
    date: '2026-05-23',
    startAt: '12:00',
    endAt: '13:00',
    participantCount: 1,
  },
  {
    voteId: 1,
    slotId: 6,
    date: '2026-05-24',
    startAt: '14:00',
    endAt: '15:00',
    participantCount: 1,
  },
  {
    voteId: 1,
    slotId: 7,
    date: '2026-05-24',
    startAt: '15:00',
    endAt: '16:00',
    participantCount: 3,
  },
  {
    voteId: 1,
    slotId: 8,
    date: '2026-05-24',
    startAt: '16:00',
    endAt: '17:00',
    participantCount: 1,
  },
  {
    voteId: 1,
    slotId: 9,
    date: '2026-05-26',
    startAt: '10:00',
    endAt: '11:00',
    participantCount: 1,
  },
  {
    voteId: 1,
    slotId: 10,
    date: '2026-05-26',
    startAt: '11:00',
    endAt: '12:00',
    participantCount: 1,
  },

  {
    voteId: 2,
    slotId: 11,
    date: '2026-05-25',
    startAt: '00:00',
    endAt: '23:59',
    participantCount: 2,
  },
  {
    voteId: 2,
    slotId: 12,
    date: '2026-05-26',
    startAt: '00:00',
    endAt: '23:59',
    participantCount: 1,
  },
  {
    voteId: 2,
    slotId: 13,
    date: '2026-05-27',
    startAt: '00:00',
    endAt: '23:59',
    participantCount: 2,
  },

  {
    voteId: 3,
    slotId: 14,
    date: '2026-05-15',
    startAt: '10:00',
    endAt: '11:00',
    participantCount: 4,
  },
  {
    voteId: 3,
    slotId: 15,
    date: '2026-05-15',
    startAt: '11:00',
    endAt: '12:00',
    participantCount: 3,
  },
  {
    voteId: 3,
    slotId: 16,
    date: '2026-05-16',
    startAt: '14:00',
    endAt: '15:00',
    participantCount: 2,
  },

  {
    voteId: 4,
    slotId: 17,
    date: '2026-05-27',
    startAt: '00:00',
    endAt: '23:59',
    participantCount: 2,
  },
  {
    voteId: 4,
    slotId: 18,
    date: '2026-05-28',
    startAt: '00:00',
    endAt: '23:59',
    participantCount: 1,
  },

  {
    voteId: 5,
    slotId: 19,
    date: '2026-05-19',
    startAt: '13:00',
    endAt: '14:00',
    participantCount: 3,
  },
  {
    voteId: 5,
    slotId: 20,
    date: '2026-05-19',
    startAt: '14:00',
    endAt: '15:00',
    participantCount: 2,
  },
];
