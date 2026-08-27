'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PUBLIC_PATHS = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isLoading || isPublicPath) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isPublicPath, router]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <span className="text-sm font-medium text-[#989898]">
          불러오는 중...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
