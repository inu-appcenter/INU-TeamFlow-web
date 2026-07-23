export type InfoPostCategory = 'CONTEST' | 'STUDY' | 'PROJECT' | 'CLUB' | 'ETC';

export interface InfoPostSummaryResponse {
  infoPostId: number;
  category: InfoPostCategory;
  linkable: boolean;
  title: string;
  thumbnailUrl: string | null;
  recruitmentCount: number;
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
  keyword?: string;
  linkable?: boolean;
  page?: number;
  size?: number;
}

export interface InfoPostImagePresignedUrlRequest {
  fileName: string;
  contentType: string;
}

export interface InfoPostImagePresignedUrlResponse {
  uploadUrl: string;
  imageKey: string;
}
