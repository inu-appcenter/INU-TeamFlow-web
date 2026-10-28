'use client';

import '@/lib/axiosInstance';
import './globals.css';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/providers/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import { ChatSocketProvider } from '@/contexts/ChatSocketContext';
import { pretendard } from '@/lib/fonts';
import { useMetadata } from '@/hooks/useMetadata';
import NavigationTracker from '@/components/common/NavigationTracker';
import BottomNav from '@/components/common/bottom-nav/BottomNav';

// 하단 네비게이션을 보여줄 경로
const BOTTOM_NAV_PATHS = ['/main', '/calendar', '/team', '/chat', '/mypage'];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const isMobileNotice = pathname === '/mobile-notice';
  const isLanding = pathname === '/';
  const showBottomNav = BOTTOM_NAV_PATHS.includes(pathname);
  useMetadata();

  return (
    <html lang="ko" className={cn('font-pretendard', pretendard.variable)}>
      <body className="bg-[#F0F2F5]">
        {isMobileNotice ? (
          children
        ) : (
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {isLanding ? (
                children
              ) : (
                <>
                  <NavigationTracker />
                  <AuthGuard>
                    <ChatSocketProvider>
                      {children}
                      {showBottomNav && <BottomNav />}
                    </ChatSocketProvider>
                  </AuthGuard>
                </>
              )}
            </AuthProvider>
          </QueryClientProvider>
        )}
      </body>
    </html>
  );
}
