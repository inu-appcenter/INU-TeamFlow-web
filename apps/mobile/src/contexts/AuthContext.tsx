import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DevSettings } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getMyProfile } from "@moimi/core/api/user";
import type { UserMeResponse } from "@moimi/core/types/user";
import { secureTokenStorage, saveTokens } from "@/lib/tokenStorage";

interface AuthContextValue {
  user: UserMeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
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
      // 만료는 인터셉터가 먼저 재발급 시도 → 여기까지 오면 재발급도 실패한 경우
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

  const login = async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
    await queryClient.invalidateQueries({ queryKey: ["myInfo"] });
    await fetchUser();
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  const logout = async () => {
    await secureTokenStorage.removeToken();
    setUser(null);
    queryClient.clear();
    DevSettings.reload();
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
