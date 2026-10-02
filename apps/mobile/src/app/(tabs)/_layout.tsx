import { Redirect } from "expo-router";
import AppTabs from "@/components/app-tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@moimi/core/constants/routes";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // AuthContext가 SecureStore에서 토큰 확인 중 — 스플래시가 떠 있는 동안이라 그냥 대기
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.LOGIN as never} />;
  }

  return <AppTabs />;
}
