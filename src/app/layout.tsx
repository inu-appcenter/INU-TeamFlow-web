'use client';

import './globals.css';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ChatSocketProvider } from '@/contexts/ChatSocketContext';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className="bg-[#F0F2F5]">
        <QueryClientProvider client={queryClient}>
          <ChatSocketProvider>{children}</ChatSocketProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
