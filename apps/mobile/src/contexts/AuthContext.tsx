import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DevSettings } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "@moimi/core/api/user";
import type { UserMeResponse } from "@moimi/core/types/user";
import { secureTokenStorage, setAccessToken } from "@/lib/tokenStorage";

interface AuthContextValue {
  user: UserMeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
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
    } catch {
      await secureTokenStorage.removeToken();
      setUser(null);
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

  const login = async (token: string) => {
    await setAccessToken(token);
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
