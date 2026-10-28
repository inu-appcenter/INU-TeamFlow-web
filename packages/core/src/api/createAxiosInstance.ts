import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ROUTES } from "../constants/routes";

export interface TokenStorage {
  getToken: () => string | null | Promise<string | null>;
  setToken: (token: string) => void | Promise<void>;
  removeToken: () => void | Promise<void>;
  // 모바일 전용: 브라우저 쿠키가 없는 환경에서 refresh token을 직접 보관
  getRefreshToken?: () => string | null | Promise<string | null>;
  setRefreshToken?: (token: string) => void | Promise<void>;
}

export interface AuthRedirect {
  getCurrentPath: () => string;
  redirectToLogin: () => void;
}

interface CreateAxiosInstanceOptions {
  baseURL: string;
  tokenStorage: TokenStorage;
  authRedirect: AuthRedirect;
  // 웹: true (HttpOnly 쿠키 사용) / 모바일: false (refresh token을 직접 Cookie 헤더로 전송)
  withCredentials?: boolean;
}

interface TokenResponse {
  grantType: string;
  accessToken: string;
  refreshToken: string;
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 401이 나도 재발급을 시도하지 않을 요청
const NO_REFRESH_PATHS = ["/auth/login", "/auth/reissue"];

// 인증 실패 판별
// 서버가 토큰 오류를 HTTP 403 + body.code 401로 보내는 경우가 있어서 함께 처리
// (백엔드가 HTTP 401로 통일하면 status === 401만 남기면 됨)
function isAuthError(error: AxiosError) {
  const status = error.response?.status;
  const code = (error.response?.data as { code?: number } | undefined)?.code;
  return status === 401 || (status === 403 && code === 401);
}

export function createAxiosInstance({
  baseURL,
  tokenStorage,
  authRedirect,
  withCredentials = true,
}: CreateAxiosInstanceOptions) {
  const instance = axios.create({
    baseURL,
    withCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 재발급 전용 인스턴스 (인터셉터 없음 → 재발급 401이 무한 루프 타지 않게)
  const refreshClient = axios.create({ baseURL, withCredentials });

  // 동시에 여러 요청이 401을 받아도 재발급은 한 번만
  let refreshPromise: Promise<string> | null = null;

  const reissue = async () => {
    const headers: Record<string, string> = {};
    const storedRefreshToken = await tokenStorage.getRefreshToken?.();
    if (storedRefreshToken) {
      // 모바일: 쿠키 저장소 대신 직접 Cookie 헤더로 전송
      headers.Cookie = `refreshToken=${storedRefreshToken}`;
    }

    const { data } = await refreshClient.post<TokenResponse>(
      "/auth/reissue",
      null,
      { headers }
    );

    await tokenStorage.setToken(data.accessToken);
    await tokenStorage.setRefreshToken?.(data.refreshToken);
    return data.accessToken;
  };

  const getFreshToken = () => {
    if (!refreshPromise) {
      refreshPromise = reissue().finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  };

  const logout = async () => {
    await tokenStorage.removeToken();
    if (authRedirect.getCurrentPath() !== ROUTES.LOGIN) {
      authRedirect.redirectToLogin();
    }
  };

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
    async (error: AxiosError) => {
      const original = error.config as RetryConfig | undefined;
      const url = original?.url ?? "";
      const skipRefresh = NO_REFRESH_PATHS.some((path) => url.includes(path));

      if (!isAuthError(error) || !original || skipRefresh) {
        return Promise.reject(error);
      }

      // 토큰 없이 보낸 요청(로그아웃 상태)은 재발급하지 않음
      // → 남아있는 refreshToken 쿠키로 몰래 재로그인되는 것 방지
      const hadToken = !!original.headers?.Authorization;
      if (!hadToken) {
        await logout();
        return Promise.reject(error);
      }

      // 재발급 후 재시도했는데도 401 → 로그아웃
      if (original._retry) {
        await logout();
        return Promise.reject(error);
      }
      original._retry = true;

      try {
        const token = await getFreshToken();
        original.headers.Authorization = `Bearer ${token}`;
        return instance(original);
      } catch (refreshError) {
        // refresh token도 만료/무효 → 로그아웃
        await logout();
        return Promise.reject(refreshError);
      }
    }
  );

  return instance;
}
