export type InfoPostCategory =
  | 'CONTEST'
  | 'CLUB'
  | 'EXTERNAL_ACTIVITY'
  | 'INTERN'
  | 'CAREER_ADVICE'
  | 'CASUAL_TALK'
  | 'INFO_SHARING';

export type InfoPostType = 'NOTICE' | 'FREE';

export interface InfoPostSummaryResponse {
  infoPostId: number;
  category: InfoPostCategory;
  linkable: boolean;
  title: string;
  thumbnailUrl: string | null;
  recruitmentCount: number;
  createdAt: string;
}

export interface InfoPostAuthor {
  authorId: number;
  name: string;
  profileUrl: string | null;
}

export interface InfoPostImage {
  imageUrl: string;
  sortOrder: number;
}

export interface InfoPostDetailResponse {
  infoPostId: number;
  category: InfoPostCategory;
  linkable: boolean;
  title: string;
  content: string;
  images: InfoPostImage[];
  author: InfoPostAuthor;
  isAuthor: boolean;
  recruitmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InfoPostCreateRequest {
  category: InfoPostCategory;
  title: string;
  content: string;
  imageKeys: string[];
}

export interface InfoPostUpdateRequest {
  title: string;
  content: string;
  imageKeys: string[];
}

export interface GetInfoPostsParams {
  category?: InfoPostCategory;
  type?: InfoPostType;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface InfoPostRecruitmentSummary {
  recruitmentId: number;
  title: string;
  isOpened: boolean;
  category: string;
  recruiterName: string;
  createdAt: string;
  endAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface InfoPostImagePresignedUrlRequest {
  fileName: string;
  contentType: string;
}

export interface InfoPostImagePresignedUrlResponse {
  uploadUrl: string;
  imageKey: string;
}
