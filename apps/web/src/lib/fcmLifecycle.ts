'use client';

import { deleteToken, getToken } from 'firebase/messaging';
import { isAxiosError } from 'axios';
import { getNotificationOptions } from '@moimi/core/api/notificationOption';
import type { NotificationOptionRequest } from '@moimi/core/types/notificationOption';
import { createFcmToken, deleteFcmToken } from '@/api/fcm';
import { getFirebaseMessaging } from '@/lib/firebase';

const TOKEN_KEY = 'fcmToken';
const OWNER_KEY = 'fcmTokenOwner';
const PENDING_KEY = 'fcmPendingDeletes';

type PendingDelete = { token: string; userId: string };

export type FcmPermission = NotificationPermission | 'unsupported';

export type FcmSyncResult =
  | { status: 'registered'; token: string }
  | {
      status:
        | 'disabled'
        | 'default'
        | 'denied'
        | 'unsupported'
        | 'cancelled'
        | 'setup-required';
      cleanupFailed?: boolean;
    };

let queue: Promise<unknown> = Promise.resolve();
let revision = 0;
let automaticSyncPauses = 0;

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const run = () => {
    if (typeof navigator !== 'undefined' && 'locks' in navigator) {
      return navigator.locks.request('moimi-fcm-lifecycle', work);
    }
    return work();
  };

  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

export const cancelFcmSync = () => {
  revision += 1;
};

export const isAutomaticFcmSyncPaused = () => automaticSyncPauses > 0;

const setupKey = (userId: string | number) => `fcmSetupPending:${userId}`;

export const isNotificationSetupPending = (userId: string | number) =>
  typeof window !== 'undefined' &&
  localStorage.getItem(setupKey(userId)) === '1';

export const markNotificationSetupPending = (userId: string | number) =>
  localStorage.setItem(setupKey(userId), '1');

export const clearNotificationSetupPending = (userId: string | number) =>
  localStorage.removeItem(setupKey(userId));

export function pauseAutomaticFcmSync() {
  automaticSyncPauses += 1;
  cancelFcmSync();

  let released = false;

  return () => {
    if (!released) automaticSyncPauses -= 1;
    released = true;
  };
}

export const hasEnabledNotifications = (options: NotificationOptionRequest) =>
  options.noticeEnabled ||
  options.inviteEnabled ||
  options.applicationEnabled ||
  options.calendarEnabled ||
  options.chatEnabled;

export function getFcmPermission(): FcmPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
}

// 버튼 클릭 핸들러에서 다른 await보다 먼저 호출한다.
export async function requestFcmPermission(): Promise<FcmPermission> {
  const permission = getFcmPermission();

  return permission === 'default'
    ? Notification.requestPermission()
    : permission;
}

function readPending(): PendingDelete[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(PENDING_KEY) ?? '[]'
    );

    if (!Array.isArray(value)) return [];

    return value.filter(
      (item): item is PendingDelete =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.token === 'string' &&
        typeof item.userId === 'string'
    );
  } catch {
    return [];
  }
}

function rememberDelete(token: string, userId: string) {
  const remaining = readPending().filter(
    (item) => item.token !== token || item.userId !== userId
  );

  localStorage.setItem(
    PENDING_KEY,
    JSON.stringify([...remaining, { token, userId }])
  );
}

function forgetDelete(token: string, userId: string) {
  const remaining = readPending().filter(
    (item) => item.token !== token || item.userId !== userId
  );

  if (remaining.length) {
    localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(PENDING_KEY);
  }
}

function forgetActiveToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OWNER_KEY);
}

async function removeServerToken(token: string) {
  try {
    await deleteFcmToken({ token, deviceType: 'web' });
  } catch (error) {
    // 명세상 404는 이미 등록되지 않은 토큰이다.
    if (!isAxiosError(error) || error.response?.status !== 404) {
      throw error;
    }
  }
}

async function removeBrowserToken() {
  const errors: unknown[] = [];

  try {
    const messaging = await getFirebaseMessaging();

    if (messaging && !(await deleteToken(messaging))) {
      throw new Error('Firebase 토큰을 삭제하지 못했습니다.');
    }
  } catch (error) {
    errors.push(error);
  }

  // Firebase 삭제가 실패해도 실제 서비스 워커의 구독 해제를 시도한다.
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');

      const worker =
        registration?.active ??
        registration?.waiting ??
        registration?.installing;

      if (
        registration &&
        worker?.scriptURL.endsWith('/firebase-messaging-sw.js')
      ) {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription && !(await subscription.unsubscribe())) {
          throw new Error('브라우저 푸시 구독을 해제하지 못했습니다.');
        }
      }
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length) {
    throw new Error('브라우저 FCM 정리에 실패했습니다.', {
      cause: errors,
    });
  }
}

async function waitForActive(registration: ServiceWorkerRegistration) {
  if (registration.active) return;

  const worker = registration.installing ?? registration.waiting;

  if (!worker) {
    throw new Error('서비스 워커를 시작하지 못했습니다.');
  }

  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer);
      worker.removeEventListener('statechange', check);

      if (error) reject(error);
      else resolve();
    };

    const check = () => {
      if (registration.active || worker.state === 'activated') {
        finish();
      } else if (worker.state === 'redundant') {
        finish(new Error('서비스 워커 활성화에 실패했습니다.'));
      }
    };

    const timer = setTimeout(
      () => finish(new Error('서비스 워커 활성화 시간이 초과됐습니다.')),
      15000
    );

    worker.addEventListener('statechange', check);
    check();
  });
}

async function removeCurrentToken(userId: string | null, skipServer = false) {
  const accessToken = localStorage.getItem('accessToken');
  const token = localStorage.getItem(TOKEN_KEY);
  const owner = localStorage.getItem(OWNER_KEY) ?? userId;
  const errors: unknown[] = [];

  if (token && owner && !skipServer) {
    rememberDelete(token, owner);
  }

  if (!skipServer && userId && accessToken) {
    for (const pending of readPending().filter(
      (item) => item.userId === userId
    )) {
      const currentToken = localStorage.getItem('accessToken');

      if (currentToken && currentToken !== accessToken) return;
      if (!currentToken) break;

      try {
        await removeServerToken(pending.token);
        forgetDelete(pending.token, pending.userId);
      } catch (error) {
        errors.push(error);
      }
    }
  }

  const activeAccessToken = localStorage.getItem('accessToken');

  // 그 사이 다른 계정으로 로그인했다면 그 계정의 구독은 건드리지 않는다.
  if (activeAccessToken && activeAccessToken !== accessToken) return;

  try {
    await removeBrowserToken();

    const latestToken = localStorage.getItem('accessToken');

    if (!latestToken || latestToken === accessToken) {
      forgetActiveToken();
    }
  } catch (error) {
    errors.push(error);
  }

  if (skipServer && token && owner) {
    forgetDelete(token, owner);
  }

  if (errors.length) {
    throw new Error('FCM 삭제 작업 일부가 실패했습니다.', {
      cause: errors,
    });
  }
}

export function unregisterFcmToken(
  userId: string | number | null,
  skipServer = false
) {
  cancelFcmSync();

  const accessToken =
    typeof window === 'undefined' ? null : localStorage.getItem('accessToken');

  return enqueue(async () => {
    if (
      typeof window === 'undefined' ||
      localStorage.getItem('accessToken') !== accessToken
    ) {
      return;
    }

    await removeCurrentToken(
      userId == null ? null : String(userId),
      skipServer
    );
  });
}

export function syncFcmToken(userId: string | number): Promise<FcmSyncResult> {
  if (typeof window === 'undefined') {
    return Promise.resolve({ status: 'cancelled' });
  }

  const id = String(userId);
  const accessToken = localStorage.getItem('accessToken');
  const expectedRevision = revision;

  const isCurrent = () =>
    !!accessToken &&
    localStorage.getItem('accessToken') === accessToken &&
    revision === expectedRevision;

  return enqueue(async (): Promise<FcmSyncResult> => {
    if (!isCurrent()) return { status: 'cancelled' };

    if (isNotificationSetupPending(id)) {
      let cleanupFailed = false;

      try {
        await removeCurrentToken(id);
      } catch (error) {
        cleanupFailed = true;
        console.error('FCM 정리 재시도 필요:', error);
      }

      if (!isCurrent()) return { status: 'cancelled' };

      return { status: 'setup-required', cleanupFailed };
    }

    // 낙관적으로 변경된 캐시 대신 실제 서버 설정을 읽는다.
    let options: NotificationOptionRequest | null;

    try {
      options = await getNotificationOptions();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        options = null;
      } else {
        throw error;
      }
    }

    if (!isCurrent()) return { status: 'cancelled' };

    const permission = getFcmPermission();

    if (
      !options ||
      !hasEnabledNotifications(options) ||
      permission !== 'granted'
    ) {
      let cleanupFailed = false;

      try {
        await removeCurrentToken(id);
      } catch (error) {
        cleanupFailed = true;
        console.error('FCM 정리 재시도 필요:', error);
      }

      if (!isCurrent()) return { status: 'cancelled' };

      if (!options || !hasEnabledNotifications(options)) {
        return { status: 'disabled', cleanupFailed };
      }

      return {
        status: permission as Exclude<FcmPermission, 'granted'>,
        cleanupFailed,
      };
    }

    for (const pending of readPending().filter((item) => item.userId === id)) {
      await removeServerToken(pending.token);
      forgetDelete(pending.token, id);

      if (!isCurrent()) return { status: 'cancelled' };
    }

    const previousOwner = localStorage.getItem(OWNER_KEY);

    if (localStorage.getItem(TOKEN_KEY) && !previousOwner) {
      // 이전 코드의 토큰에는 소유자 정보가 없어 재사용하지 않는다.
      await removeBrowserToken();
      forgetActiveToken();

      if (!isCurrent()) return { status: 'cancelled' };
    } else if (previousOwner && previousOwner !== id) {
      await removeCurrentToken(id);

      if (!isCurrent()) return { status: 'cancelled' };
    }

    const messaging = await getFirebaseMessaging();

    if (!isCurrent()) return { status: 'cancelled' };
    if (!messaging) return { status: 'unsupported' };

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY가 설정되지 않았습니다.');
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );

    await waitForActive(registration);

    if (!isCurrent() || getFcmPermission() !== 'granted') {
      return { status: 'cancelled' };
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!isCurrent() || getFcmPermission() !== 'granted') {
      return { status: 'cancelled' };
    }

    if (!token) {
      throw new Error('FCM 토큰을 발급받지 못했습니다.');
    }

    const oldToken = localStorage.getItem(TOKEN_KEY);

    // POST 응답이 유실돼도 나중에 삭제할 수 있도록 먼저 저장한다.
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(OWNER_KEY, id);

    if (oldToken && oldToken !== token) {
      rememberDelete(oldToken, id);
    }

    await createFcmToken({ token, deviceType: 'web' });

    if (!isCurrent()) return { status: 'cancelled' };

    if (oldToken && oldToken !== token) {
      await removeServerToken(oldToken);
      forgetDelete(oldToken, id);
    }

    return { status: 'registered', token };
  });
}
