export type RecruitmentStatus = 'OPEN' | 'CLOSED';
export type RecruitmentCategory =
  | 'CONTEST'
  | 'STUDY'
  | 'CLUB'
  | 'PROJECT'
  | 'ETC';
export type ApplicationStatus =
  | 'WAITING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED';

export interface RecruitmentSummaryResponse {
  recruitmentId: number;
  title: string;
  status: RecruitmentStatus;
  category: RecruitmentCategory;
  announcementTitle: string | null;
  recruiterName: string;
  createdAt: string;
  endAt: string;
}

export interface RecruitmentDetailResponse {
  recruitmentId: number;
  title: string;
  status: RecruitmentStatus;
  category: RecruitmentCategory;
  description: string;
  targetMemberCount: number;
  currentMemberCount: number;
  announcementId: number | null;
  announcementTitle: string | null;
  teamId: number | null;
  teamName: string | null;
  endAt: string;
  recruiterId: number;
  recruiterName: string;
  isRecruiter: boolean;
  hasApplied: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentCreateRequest {
  title: string;
  category: RecruitmentCategory;
  description: string;
  announcementId?: number;
  teamId?: number;
  targetMemberCount: number;
  endAt: string;
}

export interface RecruitmentUpdateRequest {
  title: string;
  description: string;
  targetMemberCount: number;
  recruitmentCategory: RecruitmentCategory;
  endAt: string;
}

export interface ApplicationCreateRequest {
  introduction: string;
}

export interface ApplicationSummaryResponse {
  applicationId: number;
  introduction: string;
  status: ApplicationStatus;
  applicantName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface MyApplicationSummaryResponse {
  applicationId: number;
  status: ApplicationStatus;
  recruitmentTitle: string;
  category: RecruitmentCategory;
  announcementTitle: string | null;
  recruiterName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface ApplicationDetailResponse {
  applicationId: number;
  status: ApplicationStatus;
  introduction: string;
  recruitmentTitle: string;
  category: RecruitmentCategory;
  recruiterName: string;
  announcementTitle: string | null;
  applicantName: string;
  isRecruiter: boolean;
  createdAt: string;
  respondedAt: string | null;
}

export interface ApplicationStatusUpdateRequest {
  applicationStatus: ApplicationStatus;
}

export interface ApplicationStatusResponse {
  applicationId: number;
  status: ApplicationStatus;
  respondedAt: string | null;
}

// pageable 응답 래퍼
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}
