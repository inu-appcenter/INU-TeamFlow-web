import type { InfoPostSummaryResponse } from '@/types/infoPost';
import type {
  ApplicationStatus,
  RecruitmentCategory,
} from '@/types/recruitment';

export type MyPostType =
  | 'ALL'
  | 'RECRUITMENT'
  | 'INFOPOST'
  | 'APPLICATION'
  | 'NOTICE';

export interface MyRecruitmentResponse {
  recruitmentId: number;
  title: string;
  isOpened: boolean;
  category: string;
  recruiterName: string;
  createdAt: string;
  endAt: string;
}

export interface MyApplicationResponse {
  applicationId: number;
  applicationStatus: ApplicationStatus;
  recruitmentCategory: RecruitmentCategory;
  recruiterName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface MyTeamNoticeResponse {
  noticeId: number;
  teamId: number;
  teamName: string;
  teamCategory: RecruitmentCategory;
  title: string;
  isPinned: boolean;
  isRead: boolean;
  authorName: string;
  teamRole: string;
  createdAt: string;
  updatedAt: string;
}

export type MyPost =
  | (MyRecruitmentResponse & { type: 'RECRUITMENT' })
  | (InfoPostSummaryResponse & { type: 'INFOPOST' })
  | (MyApplicationResponse & { type: 'APPLICATION' })
  | (MyTeamNoticeResponse & { type: 'NOTICE' });
