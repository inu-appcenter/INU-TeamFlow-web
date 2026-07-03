export type VoteTab = 'ALL' | 'OPENED' | 'CLOSED';

export interface MyTeamResponse {
  teamId: number;
  name: string;
  category: string;
  memberCount: number;
  description: string;
  imageUrl: string | null;
}

export interface VoteUser {
  name: string;
  department: string;
}

export interface MyVoteResponse {
  voteId: number;
  teamId: number;
  title: string;
  description: string;
  createdDate: string;
  isOpened: boolean;
  isAllDay: boolean;
  dates: string[];
  dailyTimeStart: string | null;
  dailyTimeEnd: string | null;
  completedVoterList: VoteUser[];
  uncompletedVoterList: VoteUser[];
}

export interface MyVote extends MyVoteResponse {
  teamName: string;
}