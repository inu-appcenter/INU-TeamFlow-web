import "../../global.css";
import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider } from "@/contexts/AuthContext";
import { setCurrentPath } from "@/lib/authRedirect";
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
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
            </Stack>
          </ThemeProvider>
        </ChatSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
