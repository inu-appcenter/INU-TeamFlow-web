import type { TeamCategory, TeamRole } from '../constants/teamEnum';

export interface TeamSummaryResponse {
  teamId: number;
  name: string;
  category: TeamCategory;
  memberCount: number;
  description: string;
  imageUrl: string | null;
  teamRole: TeamRole;
}

export interface TeamDetailResponse {
  teamId: number;
  name: string;
  category: TeamCategory;
  description: string;
  memberCount: number;
  role: TeamRole;
  link: string | null;
  sns: string | null;
  imageUrl: string | null;
  joinedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TeamMemberResponse {
  teamMemberId: number;
  userId: number;
  username: string;
  teamRole: TeamRole;
  department: string;
  userNickname: string;
  profileImageUrl: string;
}

export interface TeamCreateRequest {
  name: string;
  category: TeamCategory;
  description: string;
  link?: string;
  sns?: string;
  imageKey?: string;
}

export interface TeamUpdateRequest {
  name: string;
  category: TeamCategory;
  description: string;
  link?: string;
  sns?: string;
  imageKey?: string;
}

export interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  imageKey: string;
}
