import { getApiClient } from "./client";
import type {
  PushTokenRequest,
  PushTokenResponse,
} from "@moimi/core/types/fcm";

// 서버 도메인은 push로 바뀌었지만 API 경로는 /fcm으로 통일 (프론트와 협의)
const PUSH_TOKEN_PATH = "/fcm";

/** 푸시 토큰 등록 (이미 등록된 토큰이면 기존 토큰 반환) */
export const createPushToken = (
  body: PushTokenRequest
): Promise<PushTokenResponse> =>
  getApiClient()
    .post(PUSH_TOKEN_PATH, body)
    .then((res) => res.data);

/** 푸시 토큰 삭제 (로그아웃 또는 알림 수신 거부 시) */
export const deletePushToken = (body: PushTokenRequest): Promise<void> =>
  getApiClient()
    .delete(PUSH_TOKEN_PATH, { data: body })
    .then(() => undefined);
