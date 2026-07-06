import type { TeamCategory } from '@/constants/teamEnum';

export interface TeamNoticeSummary {
  noticeId: number;
  teamId: number;
  teamName: string; // me API에서 팀 구분용
  title: string;
  isPinned: boolean;
  isRead: boolean; // 현재 유저 기준
  authorName: string;
  teamRole: string; // '팀장' | '매니저' | '팀원' 등
  createdAt: string;
  updatedAt: string;
  teamCategory: TeamCategory;
}

export interface TeamNoticeAuthor {
  userId: number;
  teamRole: string;
  name: string;
  profileUrl: string | null;
}

export interface TeamNoticeImage {
  imageUrl: string;
  sortOrder: number;
}

export interface TeamNoticeDetail {
  noticeId: number;
  title: string;
  isPinned: boolean;
  author: TeamNoticeAuthor;
  createdAt: string;
  updatedAt: string;
  images: TeamNoticeImage[];
  content: string;
  isEditable: boolean;
}

export interface TeamNoticeUpdateRequest {
  title: string;
  content: string;
  isPinned: boolean;
  imageKeys: string[];
}

export interface PresignedUrlRequestItem {
  fileName: string;
  contentType: string;
}

export interface PresignedUrlResponseItem {
  uploadUrl: string;
  imageKey: string;
}

export interface TeamNoticeCreateRequest {
  title: string;
  content: string;
  isPinned: boolean;
  imageKeys: string[];
}
