import { createAxiosInstance } from "@moimi/core/api/createAxiosInstance";
import { setApiClient } from "@moimi/core/api/client";
import { secureTokenStorage } from "./tokenStorage";
import { mobileAuthRedirect } from "./authRedirect";

const axiosInstance = createAxiosInstance({
  baseURL: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1`,
  tokenStorage: secureTokenStorage,
  authRedirect: mobileAuthRedirect,
  // 앱 자체 쿠키 저장소 대신 SecureStore의 refresh token을 직접 보냄
  withCredentials: false,
  // 서버가 모바일 로그인을 구분해서 refresh token을 30일로 발급 (재발급 때마다 30일 갱신)
  defaultHeaders: { "X-Client-Type": "mobile" },
});

setApiClient(axiosInstance);

export default axiosInstance;
