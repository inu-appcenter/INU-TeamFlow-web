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

      const isCurrent = () =>
        version === authVersion.current &&
        localStorage.getItem('accessToken') === token;

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

        stopping.current = false;
        setUser(me);
      } catch (error) {
        if (version !== authVersion.current) return;

        const activeToken = localStorage.getItem('accessToken');

        if (activeToken && activeToken !== token) return;

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

          if (
            version === authVersion.current &&
            (!localStorage.getItem('accessToken') || isCurrent())
          ) {
            clearSession();
          }
        }

        throw error;
      }
    },
    [clearSession, queryClient]
  );

  useEffect(() => {
    void fetchUser()
      .catch(() => undefined)
      .finally(() => setIsLoading(false));

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'accessToken' && event.key !== null) {
        return;
      }

      cancelFcmSync();
      clearNotice();
      setUser(null);

      void fetchUser()
        .catch(() => undefined)
        .finally(() => setIsLoading(false));
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
    authVersion.current += 1;

    const token = localStorage.getItem('accessToken');
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

        if (localStorage.getItem('accessToken') === token) {
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
