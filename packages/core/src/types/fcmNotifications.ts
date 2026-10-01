import type { UserMeResponse } from "@moimi/core/types/user";

export type FcmNotice = "default" | "denied" | "setup-required";

export interface FcmNotificationOptions {
  user: UserMeResponse | null;
  authVersion: { readonly current: number };
  stopping: { readonly current: boolean };
}

export interface FcmNotificationController {
  notice: FcmNotice | null;
  noticePending: boolean;
  noticeError: string;
  clearNotice: () => void;
  allowNotifications: () => Promise<void>;
}
