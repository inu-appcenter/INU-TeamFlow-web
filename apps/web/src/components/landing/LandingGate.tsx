'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

// ⚠️ AuthProvider에서 토큰을 저장/조회하는 방식에 맞춰 수정
const TOKEN_KEY = 'accessToken';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  try {
    return !!localStorage.getItem(TOKEN_KEY);
  } catch {
    return false;
  }
}

// 서버/하이드레이션 시점엔 아직 모름
function getServerSnapshot() {
  return null;
}

export default function LandingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (isLoggedIn) router.replace('/main');
  }, [isLoggedIn, router]);

  // 확인 전(null)이거나 로그인 상태(true)면 아무것도 안 보여줌
  if (isLoggedIn !== false) return null;
  return <>{children}</>;
}
