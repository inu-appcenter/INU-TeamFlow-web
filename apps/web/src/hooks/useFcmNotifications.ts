'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FcmNotice,
  FcmNotificationController,
  FcmNotificationOptions,
} from '@moimi/core/types/fcmNotifications';
import {
  isAutomaticFcmSyncPaused,
  pauseAutomaticFcmSync,
  requestFcmPermission,
  syncFcmToken,
} from '@/lib/fcmLifecycle';

export function useFcmNotifications({
  user,
  authVersion,
  stopping,
}: FcmNotificationOptions): FcmNotificationController {
  const [notice, setNotice] = useState<FcmNotice | null>(null);
  const [noticePending, setNoticePending] = useState(false);
  const [noticeError, setNoticeError] = useState('');

  const shownNotices = useRef(new Set<string>());
  const clearNotice = useCallback(() => setNotice(null), []);

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
    } catch {}

    if (shown) return;

    shownNotices.current.add(key);

    try {
      sessionStorage.setItem(key, '1');
    } catch {}

    setNoticeError('');
    setNotice(result.status);
  }, [user, authVersion, stopping]);

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

  return {
    notice,
    noticePending,
    noticeError,
    clearNotice,
    allowNotifications,
  };
}
