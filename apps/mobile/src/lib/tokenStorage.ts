import * as SecureStore from "expo-secure-store";
import type { TokenStorage } from "@moimi/core/api/createAxiosInstance";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const secureTokenStorage: TokenStorage = {
  getToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),

  setToken: (token) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),

  removeToken: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },

  // 모바일은 브라우저 쿠키가 없어서 refresh token을 직접 보관
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  setRefreshToken: (token) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
};

// 로그인 시 두 토큰을 함께 저장
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
};
