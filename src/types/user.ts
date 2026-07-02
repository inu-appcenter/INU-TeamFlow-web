export interface UserMeResponse {
  userId: number;
  username: string;
  email: string;
  studentNumber: string | null;
  name: string;
  role: 'USER' | 'ADMIN';
  department: string;
  isSchoolVerified: boolean;
  imageUrl: string | null;
}

export interface UpdateMyProfileRequest {
  password?: string;
  email: string;
  name: string;
  department: string;
  imageKey?: string | null;
}

export type UpdateMyProfileResponse = UserMeResponse;

export interface ProfilePresignedUrlRequest {
  fileName: string;
  contentType: string;
}

export interface ProfilePresignedUrlResponse {
  uploadUrl: string;
  imageKey: string;
}