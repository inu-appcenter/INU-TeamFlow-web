export interface VoteMember {
  name: string;
  department: string;
}

export interface MyVote {
  voteId: number;
  teamId: number;
  title: string;
  description: string;
  createdDate: string;
  isOpened: boolean;
  isAllDay: boolean;
  isVoter: boolean;
  isCreator: boolean;
  dates: string[];
  dailyTimeStart: string | null;
  dailyTimeEnd: string | null;
  completedVoterList: VoteMember[];
  uncompletedVoterList: VoteMember[];
}
