'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getMyProfile } from '@moimi/core/api/user';
import type { UserMeResponse } from '@moimi/core/types/user';
import posthog from 'posthog-js';

import FcmPermissionNotice from '@/components/common/notification/FcmPermissionNotice';
import {
  cancelFcmSync,
  isAutomaticFcmSyncPaused,
  pauseAutomaticFcmSync,
  requestFcmPermission,
  syncFcmToken,
  unregisterFcmToken,
  markNotificationSetupPending,
  clearNotificationSetupPending,
} from '@/lib/fcmLifecycle';

interface AuthContextValue {
  user: UserMeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchUser: (options?: { syncNotifications?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  finishAccountDeletion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [notice, setNotice] = useState<
    'default' | 'denied' | 'setup-required' | null
  >(null);
  const [noticePending, setNoticePending] = useState(false);
  const [noticeError, setNoticeError] = useState('');

  const identifiedUserId = useRef<string | null>(null);
  const stopping = useRef(false);
  const authVersion = useRef(0);
  const shownNotices = useRef(new Set<string>());
  const logoutPromise = useRef<Promise<void> | null>(null);

  const clearSession = useCallback(() => {
    authVersion.current += 1;
    cancelFcmSync();

    posthog.reset();
    identifiedUserId.current = null;

    localStorage.removeItem('accessToken');
    queryClient.clear();

    setNotice(null);
    setUser(null);
  }, [queryClient]);

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

          if (identifiedUserId.current) {
            posthog.reset();
          }

          posthog.identify(userId);
          identifiedUserId.current = userId;
        }

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

        // 일시적인 네트워크 오류로 로그인 토큰을 지우지 않는다.
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
      setNotice(null);
      setUser(null);

      void fetchUser()
        .catch(() => undefined)
        .finally(() => setIsLoading(false));
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchUser]);

  const checkFcm = useCallback(async () => {
    if (!user || stopping.current || isAutomaticFcmSyncPaused()) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    const version = authVersion.current;

    const result = await syncFcmToken(user.userId);

    if (
      stopping.current ||
      version !== authVersion.current ||
      token !== localStorage.getItem('accessToken')
    ) {
      return;
    }

    if (result.status === 'cancelled') return;

    if (
      result.status !== 'default' &&
      result.status !== 'denied' &&
      result.status !== 'setup-required'
    ) {
      setNotice(null);
      return;
    }

    const key = `fcmNotice:${user.userId}:${result.status}`;
    let shown = shownNotices.current.has(key);

    try {
      shown ||= sessionStorage.getItem(key) === '1';
    } catch {
      // 메모리 기록으로 대체한다.
    }

    if (shown) return;

    shownNotices.current.add(key);

    try {
      sessionStorage.setItem(key, '1');
    } catch {
      // 메모리 기록으로 대체한다.
    }

    setNoticeError('');
    setNotice(result.status);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let running = false;

    const run = () => {
      if (running || document.visibilityState === 'hidden') {
        return;
      }

      running = true;

      void checkFcm()
        .catch((error) => console.error('FCM 동기화 실패:', error))
        .finally(() => {
          running = false;
        });
    };

    run();

    window.addEventListener('focus', run);
    window.addEventListener('online', run);
    document.addEventListener('visibilitychange', run);

    return () => {
      window.removeEventListener('focus', run);
      window.removeEventListener('online', run);
      document.removeEventListener('visibilitychange', run);
    };
  }, [user, checkFcm]);

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

  const allowNotifications = async () => {
    if (!user || noticePending) return;

    const token = localStorage.getItem('accessToken');
    const resume = pauseAutomaticFcmSync();

    setNoticePending(true);
    setNoticeError('');

    try {
      const permission = await requestFcmPermission();

      if (localStorage.getItem('accessToken') !== token) {
        return;
      }

      if (permission === 'denied') {
        setNotice('denied');
        return;
      }

      if (permission !== 'granted') {
        setNotice(null);
        return;
      }

      const result = await syncFcmToken(user.userId);

      if (result.status !== 'cancelled') {
        setNotice(null);
      }
    } catch {
      setNoticeError('알림 등록에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      resume();
      setNoticePending(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refetchUser: fetchUser,
        logout: () => endSession(false),
        finishAccountDeletion: () => endSession(true),
      }}
    >
      {children}

      {user && notice && (
        <FcmPermissionNotice
          permission={notice}
          isPending={noticePending}
          error={noticeError}
          onAllow={() => {
            void allowNotifications();
          }}
          onClose={() => setNotice(null)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
