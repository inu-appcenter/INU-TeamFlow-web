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

// 검색/공유용 기본 메타 정보
const SITE_URL = 'https://moimi.inuappcenter.kr';
const SITE_TITLE = '모이미 | 대학생 팀 활동을 한 곳에서';
const SITE_DESCRIPTION =
  '팀원 모집부터 일정, 투표, 채팅, 공지까지. 대학생 팀 활동을 한 곳에서 관리하는 모이미';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

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
      <head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        {/* 카톡·SNS 공유 미리보기 */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="모이미" />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={OG_IMAGE} />
      </head>
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
