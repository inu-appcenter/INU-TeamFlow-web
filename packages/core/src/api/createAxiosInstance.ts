import axios, { type InternalAxiosRequestConfig } from "axios";
import { ROUTES } from "../constants/routes";

export interface TokenStorage {
  getToken: () => string | null | Promise<string | null>;
  removeToken: () => void | Promise<void>;
}

export interface AuthRedirect {
  getCurrentPath: () => string;
  redirectToLogin: () => void;
}

interface CreateAxiosInstanceOptions {
  baseURL: string;
  tokenStorage: TokenStorage;
  authRedirect: AuthRedirect;
}

export function createAxiosInstance({
  baseURL,
  tokenStorage,
  authRedirect,
}: CreateAxiosInstanceOptions) {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await tokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url;
      const isLoginRequest = requestUrl?.includes("/auth/login");

      if (status === 401 && !isLoginRequest) {
        await tokenStorage.removeToken();
        if (authRedirect.getCurrentPath() !== ROUTES.LOGIN) {
          authRedirect.redirectToLogin();
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
