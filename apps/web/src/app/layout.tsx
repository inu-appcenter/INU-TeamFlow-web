'use client';

import './globals.css';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { ChatSocketProvider } from '@/contexts/ChatSocketContext';
import { pretendard } from '@/lib/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="ko" className={cn('font-pretendard', pretendard.variable)}>
      <body className="bg-[#F0F2F5]">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGuard>
              <ChatSocketProvider>{children}</ChatSocketProvider>
            </AuthGuard>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
