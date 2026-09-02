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
  isOpened: boolean;
  category: RecruitmentCategory;
  announcementTitle: string | null;
  recruiterName: string;
  createdAt: string;
  endAt: string;
}

export interface RecruitmentDetailResponse {
  announcementId: number;
  recruitmentId: number;
  title: string;
  isOpened: boolean;
  category: RecruitmentCategory;
  description: string;
  targetMemberCount: number;
  currentMemberCount: number;
  infoPostId: number | null;
  infoPostTitle: string | null;
  teamId: number | null;
  teamName: string | null;
  endAt: string;
  recruiterId: number;
  recruiterName: string;
  isRecruiter: boolean;
  hasApplied: boolean;
  isScrap: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentCreateRequest {
  title: string;
  category: RecruitmentCategory;
  description: string;
  infoPostId?: number;
  teamId?: number;
  targetMemberCount: number;
  endAt: string;
}

export interface RecruitmentUpdateRequest {
  title: string;
  description: string;
  targetMemberCount: number;
  endAt: string;
}

export interface ApplicationCreateRequest {
  introduction: string;
}

export interface ApplicationSummaryResponse {
  applicationId: number;
  introduction: string;
  applicationStatus: ApplicationStatus;
  applicantName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface MyApplicationSummaryResponse {
  applicationId: number;
  applicationStatus: ApplicationStatus;
  recruitmentTitle: string;
  category: RecruitmentCategory;
  announcementTitle: string | null;
  recruiterName: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface ApplicationDetailResponse {
  applicationId: number;
  applicationStatus: ApplicationStatus;
  introduction: string;
  teamId: number;
  recruitmentTitle: string;
  category: RecruitmentCategory;
  recruiterName: string;
  applicantDepartment: string;
  applicantStudentNumber: string;
  announcementTitle: string | null;
  applicantName: string;
  isRecruiter: boolean;
  applicantId: number;
  createdAt: string;
  respondedAt: string | null;
}

export interface ApplicationStatusUpdateRequest {
  applicationStatus: ApplicationStatus;
}

export interface ApplicationStatusResponse {
  applicationId: number;
  applicationStatus: ApplicationStatus;
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
