// src/app/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useMyProfile } from '@/hooks/useUserQuery';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useMyProfile();

  useEffect(() => {
    if (isLoading) return;

    if (isError || !profile || profile.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [isLoading, isError, profile, router]);

  if (isLoading || isError || !profile || profile.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F2F5] text-sm text-[#9C9C9C]">
        권한을 확인 중이에요...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F0F2F5]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
        {children}
      </main>
    </div>
  );
}
