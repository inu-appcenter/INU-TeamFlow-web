import type { RecruitmentCategory } from './recruitment';

export type VoteTab = 'ALL' | 'ONGOING' | 'ENDED';

export interface MyVote {
  voteId: number;
  teamId: number;
  teamName: string;
  teamCategory: RecruitmentCategory;

  title: string;
  description: string;

  isOpened: boolean;

  createdDate: string;

  completedVoterList: unknown[];
  uncompletedVoterList: unknown[];

  dates: string[];

  isAllDay: boolean;
  dailyTimeStart: string | null;
  dailyTimeEnd: string | null;
}
