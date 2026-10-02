import type { UserMeResponse } from "./user";
import type { ReactNode } from "react";
import type { FcmNotificationController } from "./fcmNotifications";

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

export interface MyInfoResponse {
  userId: number;
  username: string;
  email: string;
  studentNumber: string;
  name: string;
  role: "USER" | "ADMIN";
  department: string;
  isSchoolVerified: boolean;
  imageUrl?: string | null;
}
export interface VerifySchoolRequest {
  studentNumber: string;
  portalPassword: string;
}

export type VerifySchoolResponse = UserMeResponse;

export interface AuthContextValue {
  user: UserMeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchUser: (options?: { syncNotifications?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  finishAccountDeletion: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthSessionState {
  contextValue: AuthContextValue;
  notifications: FcmNotificationController;
}
