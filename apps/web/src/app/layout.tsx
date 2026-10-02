'use client';

import '@/lib/axiosInstance';
import './globals.css';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/providers/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import { ChatSocketProvider } from '@/contexts/ChatSocketContext';
import { pretendard } from '@/lib/fonts';
import { useMetadata } from '@/hooks/useMetadata';
import DesktopRecommendModal from '@/components/common/DesktopRecommendModal';
import NavigationTracker from '@/components/common/NavigationTracker';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  useMetadata();
  return (
    <html lang="ko" className={cn('font-pretendard', pretendard.variable)}>
      <body className="bg-[#F0F2F5]">
        <NavigationTracker />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGuard>
              <ChatSocketProvider>
                {children}
                <DesktopRecommendModal />
              </ChatSocketProvider>
            </AuthGuard>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
