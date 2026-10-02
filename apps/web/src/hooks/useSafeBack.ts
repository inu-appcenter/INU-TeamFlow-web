'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const IN_APP_NAV_KEY = 'moimi:inAppNav';

export function markInAppNavigation() {
  try {
    sessionStorage.setItem(IN_APP_NAV_KEY, '1');
  } catch {
    // sessionStorage 접근 불가 환경은 무시
  }
}

function hasInAppHistory() {
  try {
    return sessionStorage.getItem(IN_APP_NAV_KEY) === '1';
  } catch {
    return false;
  }
}

// 앱 안에서 이동한 기록이 있으면 router.back(),
// 새 탭·URL 직접 진입처럼 기록이 없으면 fallback으로 replace
export function useSafeBack() {
  const router = useRouter();

  return useCallback(
    (fallback: string) => {
      if (hasInAppHistory()) {
        router.back();
      } else {
        router.replace(fallback);
      }
    },
    [router]
  );
}
