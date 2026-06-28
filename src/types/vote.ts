export interface EventVoteResponse {
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

export interface EventVoteCreateRequest {
  title: string;
  description: string;
  participants: number[];
  isAllDay: boolean;
  dates: string[];
  dailyTimeStart: string | null;
  dailyTimeEnd: string | null;
}

export interface EventVoteTimeSlotResponse {
  slotId: number;
  date: string;
  startAt: string;
  endAt: string;
  participantCount: number;
}

export interface EventVoteTimeSlotSelectRequest {
  slotIdList: number[];
}

export interface EventVoteTimeSelectRequest {
  title: string;
  isAllDay: boolean;
  selectedStartAt: string;
  selectedEndAt: string;
}
