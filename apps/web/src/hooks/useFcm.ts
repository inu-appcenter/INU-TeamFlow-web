'use client';

import { useCallback } from 'react';
import { deleteToken, getToken } from 'firebase/messaging';

import { createFcmToken, deleteFcmToken } from '@/api/fcm';
import { getFirebaseMessaging } from '@/lib/firebase';

const FCM_TOKEN_STORAGE_KEY = 'fcmToken';

export const useFcm = () => {
  const registerFcmToken = useCallback(async () => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!('Notification' in window)) {
      throw new Error('이 브라우저는 알림 기능을 지원하지 않습니다.');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      throw new Error('이 브라우저에서는 FCM을 사용할 수 없습니다.');
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY가 설정되지 않았습니다.');
    }

    await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const serviceWorkerRegistration = await navigator.serviceWorker.ready;

    if (!serviceWorkerRegistration.active) {
      throw new Error('서비스 워커가 활성화되지 않았습니다.');
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      throw new Error('FCM 토큰을 발급받지 못했습니다.');
    }

    await createFcmToken({
      token,
      deviceType: 'web',
    });

    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

    return token;
  }, []);

  const unregisterFcmToken = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

    if (!storedToken) {
      return;
    }

    const messaging = await getFirebaseMessaging();

    try {
      await deleteFcmToken({
        token: storedToken,
        deviceType: 'web',
      });

      if (messaging) {
        await deleteToken(messaging);
      }
    } finally {
      localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    }
  }, []);

  return {
    registerFcmToken,
    unregisterFcmToken,
  };
};
