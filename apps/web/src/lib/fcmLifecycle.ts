'use client';

import { deleteToken, getToken } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';
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
let messagingWithRootRegistration: Messaging | null = null;

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  // navigator.locks.request는 콜백이 Promise를 반환하면 Promise<Promise<T>>로 추론됨
  // async로 감싸서 Promise<T>로 펼침 (런타임 동작은 동일)
  const run = async (): Promise<T> => {
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
  if (remaining.length)
    localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  else localStorage.removeItem(PENDING_KEY);
}

function forgetActiveToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OWNER_KEY);
}

async function removeServerToken(token: string) {
  try {
    await deleteFcmToken({ token, deviceType: 'web' });
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;
  }
}

async function removeBrowserToken() {
  const errors: unknown[] = [];
  if (messagingWithRootRegistration) {
    try {
      if (!(await deleteToken(messagingWithRootRegistration))) {
        throw new Error('Firebase 토큰을 삭제하지 못했습니다.');
      }
    } catch (error) {
      errors.push(error);
    }
    messagingWithRootRegistration = null;
  }

  // 서버 DELETE와 PushSubscription 해제로 수신을 중단
  if ('serviceWorker' in navigator) {
    for (const scope of ['/', '/firebase-cloud-messaging-push-scope']) {
      try {
        const registration =
          await navigator.serviceWorker.getRegistration(scope);
        const exactScope = new URL(scope, location.origin).href;
        if (!registration || registration.scope !== exactScope) continue;
        const worker =
          registration.active ??
          registration.waiting ??
          registration.installing;
        if (
          worker &&
          new URL(worker.scriptURL).pathname !== '/firebase-messaging-sw.js'
        )
          continue;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription && !(await subscription.unsubscribe())) {
          throw new Error('브라우저 푸시 구독을 해제하지 못했습니다.');
        }
        if (scope !== '/' && !(await registration.unregister())) {
          throw new Error('기본 FCM 서비스 워커를 해제하지 못했습니다.');
        }
      } catch (error) {
        errors.push(error);
      }
    }
  }
  if (errors.length)
    throw new Error('브라우저 FCM 정리에 실패했습니다.', { cause: errors });
}

async function waitForActive(registration: ServiceWorkerRegistration) {
  if (registration.active) return;
  const worker = registration.installing ?? registration.waiting;
  if (!worker) throw new Error('서비스 워커를 시작하지 못했습니다.');
  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer);
      worker.removeEventListener('statechange', check);
      if (error) reject(error);
      else resolve();
    };
    const check = () => {
      if (registration.active || worker.state === 'activated') finish();
      else if (worker.state === 'redundant')
        finish(new Error('서비스 워커 활성화에 실패했습니다.'));
    };
    const timer = setTimeout(
      () => finish(new Error('서비스 워커 활성화 시간이 초과됐습니다.')),
      15000
    );
    worker.addEventListener('statechange', check);
    check();
  });
}

// 인증이 없어지는 탈퇴 후에는 브라우저만 정리함
// 서버의 탈퇴 API가 해당 계정의 모든 기기 토큰을 삭제
async function removeCurrentToken(userId: string | null, skipServer = false) {
  const accessToken = localStorage.getItem('accessToken');
  const token = localStorage.getItem(TOKEN_KEY);
  const owner = localStorage.getItem(OWNER_KEY) ?? userId;
  const errors: unknown[] = [];
  if (token && owner && !skipServer) {
    rememberDelete(token, owner);
  }
  // 서버의 DELETE는 현재 인증된 사용자의 토큰에만 요청
  // 계정이 바꼈으면 이전 계정의 삭제는 보류하고 브라우저 구독만 해제
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

  // 서버 DELETE가 실패해도 브라우저 구독 해제는 따로 시도
  // 다른 탭에서 계정이 바뀌었으면 새 계정의 구독을 건드리지 않기
  const activeAccessToken = localStorage.getItem('accessToken');
  if (activeAccessToken && activeAccessToken !== accessToken) return;
  try {
    await removeBrowserToken();
    const latestToken = localStorage.getItem('accessToken');
    if (!latestToken || latestToken === accessToken) forgetActiveToken();
  } catch (error) {
    errors.push(error);
    // 서버에서 지웠더라도 브라우저 정리 재시도를 위해 활성 토큰은 보관
  }

  if (skipServer && token && owner && owner === userId)
    forgetDelete(token, owner);
  if (errors.length)
    throw new Error('FCM 삭제 작업 일부가 실패했습니다.', { cause: errors });
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
    )
      return;
    await removeCurrentToken(
      userId == null ? null : String(userId),
      skipServer
    );
  });
}

export function syncFcmToken(userId: string | number): Promise<FcmSyncResult> {
  if (typeof window === 'undefined')
    return Promise.resolve({ status: 'cancelled' });
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

    let options: NotificationOptionRequest | null;
    try {
      options = await getNotificationOptions();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) options = null;
      else throw error;
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
      if (!options || !hasEnabledNotifications(options))
        return { status: 'disabled', cleanupFailed };
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

    // 이 브라우저 프로필에서 계정이 바뀐 경우만 정리한다.
    // 다른 기기/브라우저의 토큰은 요청하지 않는다.
    const previousOwner = localStorage.getItem(OWNER_KEY);
    if (localStorage.getItem(TOKEN_KEY) && !previousOwner) {
      await removeBrowserToken();
      forgetActiveToken();
      if (!isCurrent()) return { status: 'cancelled' };
    } else if (previousOwner && previousOwner !== id) {
      // 현재 인증은 새 계정의 것이므로 이전 계정의 DELETE는 여기서 할 수 없다.
      // 삭제 대기 기록을 남기고 기존 브라우저 구독을 끊는다.
      await removeCurrentToken(id);
      if (!isCurrent()) return { status: 'cancelled' };
    }

    const messaging = await getFirebaseMessaging();
    if (!isCurrent()) return { status: 'cancelled' };
    if (!messaging) return { status: 'unsupported' };
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey)
      throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY가 설정되지 않았습니다.');

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    await waitForActive(registration);
    if (!isCurrent() || getFcmPermission() !== 'granted')
      return { status: 'cancelled' };
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    messagingWithRootRegistration = messaging;
    if (!isCurrent() || getFcmPermission() !== 'granted')
      return { status: 'cancelled' };
    if (!token) throw new Error('FCM 토큰을 발급받지 못했습니다.');

    const oldToken = localStorage.getItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(OWNER_KEY, id);
    if (oldToken && oldToken !== token) rememberDelete(oldToken, id);
    await createFcmToken({ token, deviceType: 'web' });
    if (!isCurrent()) return { status: 'cancelled' };
    if (oldToken && oldToken !== token) {
      await removeServerToken(oldToken);
      forgetDelete(oldToken, id);
    }
    return { status: 'registered', token };
  });
}
