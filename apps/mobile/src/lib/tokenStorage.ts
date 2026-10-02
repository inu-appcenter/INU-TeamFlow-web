import * as SecureStore from "expo-secure-store";
import type { TokenStorage } from "@moimi/core/api/createAxiosInstance";

const ACCESS_TOKEN_KEY = "accessToken";

export const secureTokenStorage: TokenStorage = {
  getToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  removeToken: () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
};

export const setAccessToken = (token: string) =>
  SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
