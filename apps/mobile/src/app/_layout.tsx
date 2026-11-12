import "../../global.css";
import "@/lib/pushNotifications";
import { useEffect, useRef, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
  usePathname,
  useSegments,
  useRouter,
  type Href,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { AppState, useColorScheme } from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { setCurrentPath } from "@/lib/authRedirect";
import { resolveNotificationStack } from "@/lib/notificationRoute";
import "@/lib/apiClient";
import { ChatSocketProvider } from "@/contexts/ChatSocketContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function PathnameTracker() {
  const pathname = usePathname();
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);
  return null;
}

// 앱이 포그라운드로 돌아오면 React Query에 "포커스됨"을 알려서
// 오래된 쿼리를 자동으로 다시 불러오게 함 (web의 탭 포커스와 같은 역할)
function AppStateFocusSync() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => subscription.remove();
  }, []);
  return null;
}

// 알림 탭 → redirectUrl 화면으로 이동
function NotificationNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [pendingStack, setPendingStack] = useState<string[] | null>(null);
  const handledIds = useRef(new Set<string>());

  useEffect(() => {
    const handle = (response: Notifications.NotificationResponse) => {
      const { identifier, content } = response.notification.request;
      if (handledIds.current.has(identifier)) return;
      handledIds.current.add(identifier);

      setPendingStack(resolveNotificationStack(content.data?.redirectUrl));
    };

    // 앱이 꺼져 있을 때 알림을 탭해서 실행된 경우
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) handle(lastResponse);

    // 앱이 켜져 있거나 백그라운드일 때 알림을 탭한 경우
    const subscription =
      Notifications.addNotificationResponseReceivedListener(handle);

    return () => subscription.remove();
  }, []);

  // 로그인 확인이 끝난 뒤에 이동 (AuthGate와 충돌 방지)
  // 뒤로가기 경로를 위해 앞의 화면부터 차례로 쌓음
  useEffect(() => {
    if (!pendingStack || isLoading) return;

    if (isAuthenticated) {
      for (const path of pendingStack) {
        router.push(path as Href);
      }
    }
    setPendingStack(null);
  }, [pendingStack, isLoading, isAuthenticated, router]);

  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatSocketProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <PathnameTracker />
            <AppStateFocusSync />
            <AnimatedSplashOverlay />
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
              </Stack>
            </AuthGate>
            <NotificationNavigator />
          </ThemeProvider>
        </ChatSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
