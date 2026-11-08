import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
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
  // 모든 요청(재발급/로그아웃 포함)에 붙일 헤더 — 모바일: X-Client-Type
  defaultHeaders?: Record<string, string>;
}

interface TokenResponse {
  grantType: string;
  accessToken: string;
  refreshToken: string;
}

export type ApiClient = AxiosInstance & {
  // 서버의 refresh token 폐기 + refreshToken 쿠키 삭제 (Authorization 불필요)
  revokeRefreshToken: () => Promise<void>;
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 401이 나도 재발급을 시도하지 않을 요청
const NO_REFRESH_PATHS = ["/auth/login", "/auth/reissue"];

// 인증 실패는 HTTP 401로 통일됨 (403은 정지/권한 없음)
function isAuthError(error: AxiosError) {
  return error.response?.status === 401;
}

function getBearerToken(config: InternalAxiosRequestConfig) {
  const header = config.headers?.Authorization;
  return typeof header === "string" ? header.replace(/^Bearer /, "") : null;
}

export function createAxiosInstance({
  baseURL,
  tokenStorage,
  authRedirect,
  withCredentials = true,
  defaultHeaders = {},
}: CreateAxiosInstanceOptions): ApiClient {
  const instance = axios.create({
    baseURL,
    withCredentials,
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders,
    },
  });

  // 재발급/로그아웃 전용 인스턴스 (인터셉터 없음 → 401 무한 루프 방지, Authorization 안 붙음)
  // 모바일은 재발급 때도 X-Client-Type이 가야 30일로 다시 받음
  const refreshClient = axios.create({
    baseURL,
    withCredentials,
    headers: defaultHeaders,
  });

  // 동시에 여러 요청이 401을 받아도 재발급은 한 번만
  let refreshPromise: Promise<string> | null = null;

  // 모바일: 쿠키 저장소 대신 SecureStore의 refresh token을 직접 Cookie 헤더로 전송
  const getRefreshHeaders = async () => {
    const headers: Record<string, string> = {};
    const storedRefreshToken = await tokenStorage.getRefreshToken?.();
    if (storedRefreshToken) {
      headers.Cookie = `refreshToken=${storedRefreshToken}`;
    }
    return headers;
  };

  const reissue = async () => {
    const headers = await getRefreshHeaders();

    const { data } = await refreshClient.post<TokenResponse>(
      "/auth/reissue",
      null,
      { headers }
    );

    // 재발급하면 이전 refresh token은 즉시 무효 → 반드시 새 토큰으로 교체
    // (web은 Set-Cookie로 브라우저가 교체, mobile은 여기서 SecureStore 교체)
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

  const revokeRefreshToken = async () => {
    const headers = await getRefreshHeaders();

    // 모바일인데 저장된 refresh token이 없으면 서버에 보낼 게 없음
    if (tokenStorage.getRefreshToken && !headers.Cookie) return;

    await refreshClient.post("/auth/logout", null, {
      headers,
      timeout: 5000, // 서버 응답이 늦어도 로그아웃이 멈추지 않게
    });
  };

  // 인터셉터에서 인증 실패 시 강제 로그아웃
  const forceLogout = async () => {
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
      const usedToken = getBearerToken(original);
      if (!usedToken) {
        await forceLogout();
        return Promise.reject(error);
      }

      // 재발급 후 재시도했는데도 401 → 로그아웃
      if (original._retry) {
        await forceLogout();
        return Promise.reject(error);
      }
      original._retry = true;

      try {
        const token = await getFreshToken();
        original.headers.Authorization = `Bearer ${token}`;
        return instance(original);
      } catch (refreshError) {
        // web 멀티탭: 다른 탭이 먼저 재발급해서 내가 보낸 refresh 쿠키가 이미 무효화된 경우
        // → 저장소에 새 access token이 있으면 그걸로 재시도 (둘 다 로그아웃되는 것 방지)
        const latestToken = await tokenStorage.getToken();
        if (latestToken && latestToken !== usedToken) {
          original.headers.Authorization = `Bearer ${latestToken}`;
          return instance(original);
        }

        // refresh token도 만료/무효 → 로그아웃
        await forceLogout();
        return Promise.reject(refreshError);
      }
    }
  );

  return Object.assign(instance, { revokeRefreshToken });
}
