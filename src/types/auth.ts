import type { UserMeResponse } from '@/types/user';

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  department: string;
  imageKey?: string | null;
}

export interface SignupResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  department: string;
  imageUrl?: string | null;
}

export interface SchoolVerifyRequest {
  email: string;
}

export interface SchoolVerifyResponse {
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  grantType: string;
  accessToken: string;
}

export interface VerifySchoolRequest {
  studentNumber: string;
  portalPassword: string;
}

export type VerifySchoolResponse = UserMeResponse;