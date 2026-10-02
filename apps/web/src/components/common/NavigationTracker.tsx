'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { markInAppNavigation } from '@/hooks/useSafeBack';

// 앱 안에서 경로가 한 번이라도 바뀌면 기록
// → 이후 뒤로가기 시 router.back() 사용 가능 여부 판단에 사용
export default function NavigationTracker() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      markInAppNavigation();
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}
