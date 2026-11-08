import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getMyProfile } from "@moimi/core/api/user";
import { logout as requestLogout } from "@moimi/core/api/auth";
import type { UserMeResponse } from "@moimi/core/types/user";
import { secureTokenStorage, saveTokens } from "@/lib/tokenStorage";
import {
  registerPushToken,
  unregisterPushToken,
  forgetPushToken,
} from "@/lib/pushNotifications";

interface AuthContextValue {
  user: UserMeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  finishAccountDeletion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const me = await getMyProfile();
      setUser(me);
    } catch (error) {
      // 인증 실패일 때만 로그아웃 (네트워크 오류로 토큰 날리지 않게)
      // 401: 인터셉터가 재발급까지 실패한 경우 / 403: 정지된 사용자
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) {
        await secureTokenStorage.removeToken();
        setUser(null);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const token = await secureTokenStorage.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      await fetchUser();
      setIsLoading(false);
    })();
  }, []);

  // 로그인되면(앱 재실행 포함) 푸시 토큰 서버 등록
  // 이미 등록된 토큰이면 서버가 기존 토큰을 반환하므로 매번 호출해도 됨
  const userId = user?.userId;
  useEffect(() => {
    if (userId == null) return;

    registerPushToken()
      .then((token) => console.log("[push] 등록:", token))
      .catch((error) => console.error("[push] 등록 실패:", error));
  }, [userId]);

  const login = async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
    await queryClient.invalidateQueries({ queryKey: ["myInfo"] });
    await fetchUser();
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  // SecureStore의 access/refresh 둘 다 삭제 + 상태/캐시 정리
  const clearLocalSession = async () => {
    await secureTokenStorage.removeToken();
    setUser(null);
    queryClient.clear();
  };

  const logout = async () => {
    // 1. 푸시 토큰 삭제 (인증 필요 → access token 삭제 전에)
    try {
      await unregisterPushToken();
    } catch (error) {
      console.error("[push] 해제 실패:", error);
    }

    // 2. refresh token 폐기 (SecureStore에서 꺼내 보내야 하므로 삭제 전에)
    try {
      await requestLogout();
    } catch (error) {
      console.error("로그아웃 API 실패:", error);
    }

    // 3. 로컬 정리 (앞 단계가 실패해도 진행)
    await clearLocalSession();
  };

  // 탈퇴 시 서버가 refresh token과 푸시 토큰을 이미 삭제 → 로컬만 정리
  const finishAccountDeletion = async () => {
    await forgetPushToken();
    await clearLocalSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        refetchUser,
        logout,
        finishAccountDeletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
