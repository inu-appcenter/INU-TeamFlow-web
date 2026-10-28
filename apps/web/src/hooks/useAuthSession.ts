'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getMyProfile } from '@moimi/core/api/user';
import type { UserMeResponse } from '@moimi/core/types/user';
import type { AuthSessionState } from '@moimi/core/types/auth';
import { identifyAnalyticsUser, resetAnalyticsIdentity } from '@/lib/analytics';
import {
  cancelFcmSync,
  pauseAutomaticFcmSync,
  unregisterFcmToken,
  markNotificationSetupPending,
  clearNotificationSetupPending,
} from '@/lib/fcmLifecycle';
import { useFcmNotifications } from './useFcmNotifications';
import { updateAnalyticsVerification } from '@/lib/analytics/client';

export function useAuthSession(): AuthSessionState {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const identifiedUserId = useRef<string | null>(null);
  const stopping = useRef(false);
  const authVersion = useRef(0);
  const logoutPromise = useRef<Promise<void> | null>(null);

  const notifications = useFcmNotifications({ user, authVersion, stopping });
  const { clearNotice } = notifications;

  const clearSession = useCallback(() => {
    authVersion.current += 1;
    cancelFcmSync();

    resetAnalyticsIdentity();
    identifiedUserId.current = null;

    localStorage.removeItem('accessToken');
    queryClient.clear();

    clearNotice();
    setUser(null);
  }, [clearNotice, queryClient]);

  const fetchUser = useCallback(
    async (options?: { syncNotifications?: boolean }) => {
      const token = localStorage.getItem('accessToken');
      const version = ++authVersion.current;

      if (!token) {
        try {
          await unregisterFcmToken(identifiedUserId.current, true);
        } catch (error) {
          console.error('로그인되지 않은 브라우저의 FCM 정리 실패:', error);
        }

        if (
          version === authVersion.current &&
          !localStorage.getItem('accessToken')
        ) {
          clearSession();
        }
        return;
      }

      // 토큰 값은 비교하지 않음: 요청 중 401 → 재발급으로 토큰이 바뀔 수 있음
      // 다른 탭의 로그인/로그아웃은 storage 이벤트 → fetchUser()로 authVersion이 올라가서 걸러짐
      const isCurrent = () =>
        version === authVersion.current &&
        !!localStorage.getItem('accessToken');

      try {
        const me = await getMyProfile();

        if (!isCurrent()) return;

        if (me.userId == null) {
          throw new Error('사용자 ID를 확인하지 못했습니다.');
        }

        const userId = String(me.userId);

        if (options?.syncNotifications === false) {
          markNotificationSetupPending(userId);
        } else if (options?.syncNotifications === true) {
          clearNotificationSetupPending(userId);
        }

        if (identifiedUserId.current !== userId) {
          cancelFcmSync();
          queryClient.clear();

          identifiedUserId.current = userId;
        }

        identifyAnalyticsUser(userId);
        updateAnalyticsVerification(me.isSchoolVerified);

        stopping.current = false;
        setUser(me);
      } catch (error) {
        if (version !== authVersion.current) return;

        const activeToken = localStorage.getItem('accessToken');

        // 인터셉터가 재발급까지 실패했다면 토큰은 이미 삭제된 상태
        if (
          !activeToken ||
          (isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403))
        ) {
          try {
            await unregisterFcmToken(identifiedUserId.current, true);
          } catch (cleanupError) {
            console.error('FCM 구독 정리 실패:', cleanupError);
          }

          if (version === authVersion.current) {
            clearSession();
          }
        }

        throw error;
      }
    },
    [clearSession, queryClient]
  );

  useEffect(() => {
    const load = () => {
      void fetchUser()
        .catch(() => undefined)
        .finally(() => setIsLoading(false));
    };

    // effect 본문에서 직접 호출하지 않고 마이크로태스크로 넘김
    // (fetchUser 내부 setState가 effect의 동기 실행으로 잡히지 않도록)
    queueMicrotask(load);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'accessToken' && event.key !== null) {
        return;
      }

      // 이전 값 → 새 값 교체 = 다른 탭에서 재발급(또는 계정 전환)
      // → 화면을 비우지 않고 조용히 다시 확인 (계정이 바뀌었으면 fetchUser가 캐시 정리)
      const isTokenRotation = !!event.oldValue && !!event.newValue;

      if (!isTokenRotation) {
        cancelFcmSync();
        clearNotice();
        setUser(null);
      }

      load();
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [clearNotice, fetchUser]);

  const endSession = (accountDeleted: boolean) => {
    if (logoutPromise.current) {
      return logoutPromise.current;
    }

    stopping.current = true;
    const version = ++authVersion.current;

    const resume = pauseAutomaticFcmSync();

    const task = (async () => {
      try {
        await unregisterFcmToken(user?.userId ?? null, accountDeleted);
      } catch (error) {
        console.error('FCM 삭제 실패:', error);
      } finally {
        if (accountDeleted && user) {
          clearNotificationSetupPending(user.userId);
        }

        // 토큰 값 대신 버전으로 비교: 로그아웃 중 재발급돼도 정상 로그아웃
        // (다른 탭에서 새로 로그인하면 storage 이벤트로 버전이 올라가서 건너뜀)
        if (authVersion.current === version) {
          clearSession();
        }

        resume();
        logoutPromise.current = null;
      }
    })();

    logoutPromise.current = task;
    return task;
  };

  return {
    contextValue: {
      user,
      isAuthenticated: !!user,
      isLoading,
      refetchUser: fetchUser,
      logout: () => endSession(false),
      finishAccountDeletion: () => endSession(true),
    },
    notifications,
  };
}
