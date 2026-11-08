import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { isAxiosError } from "axios";
import { createPushToken, deletePushToken } from "@moimi/core/api/pushToken";

const PUSH_TOKEN_KEY = "expoPushToken";

// 앱을 보고 있을 때(포그라운드)도 알림 배너 표시
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 알림 권한 요청 → Expo Push Token 발급
 * 시뮬레이터이거나 권한을 거부하면 null
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[push] 실기기가 아니라서 토큰 발급 생략");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;

  if (existingStatus !== "granted") {
    const result = await Notifications.requestPermissionsAsync();
    status = result.status;
  }

  if (status !== "granted") {
    console.log("[push] 알림 권한 거부됨");
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "EAS projectId를 찾을 수 없습니다. app.json의 extra.eas.projectId를 확인하세요."
    );
  }

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

/** 로그인 후 호출: 토큰 발급 → 서버 등록 → 로컬 저장 */
export async function registerPushToken(): Promise<string | null> {
  const token = await getExpoPushToken();
  if (!token) return null;

  await createPushToken({ token, deviceType: "ios", provider: "EXPO" });
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  return token;
}

/**
 * 로그아웃 시 호출: 서버에서 토큰 삭제 → 로컬 삭제
 * 인증이 필요하므로 SecureStore의 access token을 지우기 전에 호출해야 함
 */
export async function unregisterPushToken(): Promise<void> {
  const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (!token) return;

  try {
    await deletePushToken({ token, deviceType: "ios", provider: "EXPO" });
  } catch (error) {
    // 서버에 이미 없는 토큰이면 성공으로 처리
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;
  } finally {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  }
}

/** 탈퇴 시 호출: 서버가 계정의 토큰을 모두 지우므로 로컬만 삭제 */
export async function forgetPushToken(): Promise<void> {
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
